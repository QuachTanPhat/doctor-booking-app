import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

const startCleanupJob = () => {
    // Chạy mỗi 1 phút
    cron.schedule('* * * * *', async () => {
    
        try {
            const now = new Date();
            const timeLimit = new Date(now.getTime() - 5 * 60 * 1000); // 5 phút trước

            const query = {
                createdAt: { $lt: timeLimit }, 
                cancelled: false,
                isCompleted: false,
                isApproved: false, 
                payment: false
            };

            const staleAppointments = await appointmentModel.find(query);

            if (staleAppointments.length === 0) {
                return;
            }

            console.log(`⚠️ Tìm thấy ${staleAppointments.length} lịch treo (Chưa thanh toán) quá hạn 5p.`);

            for (const appt of staleAppointments) {
                const { docId, slotDate, slotTime } = appt;
                
                const doctor = await doctorModel.findById(docId);
                if (doctor) {
                    let slots_booked = doctor.slots_booked;

                    if (slots_booked[slotDate]) {
                        slots_booked[slotDate] = slots_booked[slotDate].filter(t => t !== slotTime);
                        
                        if (slots_booked[slotDate].length === 0) {
                            delete slots_booked[slotDate];
                        }
                        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
                        console.log(`User ${docId} - Đã trả slot ${slotTime} ngày ${slotDate}`);
                    }
                }
            }

            // Cập nhật trạng thái Hủy
            await appointmentModel.updateMany(
                { _id: { $in: staleAppointments.map(a => a._id) } },
                { cancelled: true } // Có thể thêm field cancelReason: "Payment timeout"
            );

            console.log('✅ Đã hủy xong các lịch chưa thanh toán!');

        } catch (error) {
            console.error('❌ Lỗi Cron Job:', error);
        }
    });
};

export default startCleanupJob;