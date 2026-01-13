import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

// Biến cờ hiệu toàn cục: Kiểm soát trạng thái Job

let isJobRunning = false;

const startCleanupJob = () => {
    // Tăng thời gian lên 2 phút/lần (*/2) để tránh quá tải Docker
    cron.schedule('*/2 * * * *', async () => {
        
        // --- CƠ CHẾ KHÓA (LOCKING) ---
        // Nếu Job trước chưa chạy xong, thì Job này tự hủy ngay lập tức
        if (isJobRunning) {
            console.log('⚠️ [Cron Job] Lượt quét trước chưa xong, bỏ qua lượt này để tránh treo Server.');
            return;
        }
        isJobRunning = true;

        try {
            const now = new Date();
            const timeLimit = new Date(now.getTime() - 5 * 60 * 1000); 

            const query = {
                createdAt: { $lt: timeLimit }, 
                cancelled: false,
                isCompleted: false,
                isApproved: false, 
                payment: false,
            };

            // Tìm các lịch bị treo
            const staleAppointments = await appointmentModel.find(query);

            // Nếu không có gì thì thôi, kết thúc nhanh
            if (staleAppointments.length === 0) {
                return;
            }

            console.log(`🧹 [Cron Job] Tìm thấy ${staleAppointments.length} lịch treo. Đang xử lý...`);

            const updatePromises = staleAppointments.map(async (appt) => {
                try {
                    const { docId, slotDate, slotTime } = appt;
                    const doctor = await doctorModel.findById(docId);
                    
                    if (doctor) {
                        let slots_booked = doctor.slots_booked;
                        if (slots_booked[slotDate]) {
                            // Lọc bỏ giờ đó ra khỏi danh sách
                            slots_booked[slotDate] = slots_booked[slotDate].filter(t => t !== slotTime);
                            
                            // Nếu ngày đó trống trơn thì xóa luôn key ngày đó cho nhẹ DB
                            if (slots_booked[slotDate].length === 0) {
                                delete slots_booked[slotDate];
                            }
                            
                            // Cập nhật lại Database bác sĩ
                            // minimize: false để đảm bảo object rỗng không bị Mongo tự xóa nếu cần
                            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
                        }
                    }
                } catch (err) {
                    console.error(`❌ Lỗi xử lý đơn ${appt._id}:`, err.message);
                }
            });

            // Chờ tất cả các thao tác trả slot hoàn tất
            await Promise.allSettled(updatePromises);

            // --- CẬP NHẬT TRẠNG THÁI HỦY HÀNG LOẠT ---
            // Chỉ gọi DB 1 lần duy nhất để update tất cả các đơn
            await appointmentModel.updateMany(
                { _id: { $in: staleAppointments.map(a => a._id) } },
                { cancelled: true } 
            );

            console.log(`✅ [Cron Job] Đã hủy thành công ${staleAppointments.length} lịch chưa thanh toán!`);

        } catch (error) {
            console.error('❌ [Cron Job] Lỗi hệ thống:', error);
        } finally {
            isJobRunning = false;
        }
    });
};

export default startCleanupJob;