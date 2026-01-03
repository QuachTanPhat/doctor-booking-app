import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AllAppointment = () => {
    const {
        aToken,
        appointments,
        getAllAppointments,
        cancelAppointment,
        completeAppointment,
        approveAppointment,
        deleteAppointment
    } = useContext(AdminContext);

    const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

    // --- STATE TÌM KIẾM & BỘ LỌC ---
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // 1. THÊM STATE LỌC NGÀY
    const [filterDate, setFilterDate] = useState("");

    const [filteredList, setFilteredList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (aToken) {
            getAllAppointments();
        }
    }, [aToken]);

    // --- LOGIC LỌC & SẮP XẾP DỮ LIỆU ---
    useEffect(() => {
        if (appointments) {
            const lowerText = filterText.toLowerCase();

            // LỌC DỮ LIỆU
            let filtered = appointments.filter(item => {
                // A. Lọc theo text (Tên người dùng hoặc Bác sĩ)
                const matchesText = item.userData.name.toLowerCase().includes(lowerText) ||
                    item.docData.name.toLowerCase().includes(lowerText);

                // B. Lọc theo trạng thái
                let matchesStatus = true;
                if (statusFilter === 'pending') {
                    matchesStatus = !item.isApproved && !item.isCompleted && !item.cancelled;
                } else if (statusFilter === 'approved') {
                    matchesStatus = item.isApproved && !item.isCompleted && !item.cancelled;
                } else if (statusFilter === 'completed') {
                    matchesStatus = item.isCompleted;
                } else if (statusFilter === 'cancelled') {
                    matchesStatus = item.cancelled;
                }

                // C. LỌC THEO NGÀY (Logic mới)
                let matchesDate = true;
                if (filterDate) {
                    // Input date trả về: YYYY-MM-DD (VD: 2025-12-29)
                    // Database lưu: DD_MM_YYYY (VD: 29_12_2025)
                    const dateParts = filterDate.split('-');
                    const formattedDate = `${dateParts[2]}_${dateParts[1]}_${dateParts[0]}`;
                    matchesDate = item.slotDate === formattedDate;
                }

                return matchesText && matchesStatus && matchesDate;
            });

            // SẮP XẾP: MỚI NHẤT LÊN ĐẦU
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

            setFilteredList(filtered);
            setCurrentPage(1);
        }
    }, [appointments, filterText, statusFilter, filterDate]); // Nhớ thêm filterDate vào dependency

    // --- LOGIC PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    // --- XỬ LÝ ĐỔI TRẠNG THÁI ---
    const handleStatusChange = (e, item) => {
        const value = e.target.value;
        if (value === 'approved') {
            if (window.confirm(`Duyệt lịch khám của ${item.userData.name}?`)) approveAppointment(item._id);
        } else if (value === 'completed') {
            if (window.confirm("Xác nhận ca khám đã hoàn tất?")) completeAppointment(item._id);
        } else if (value === 'cancelled') {
            if (window.confirm("Bạn chắc chắn muốn hủy lịch này?")) cancelAppointment(item._id);
        }
    }

    return (
        <div className="w-full max-w-6xl m-5">

            {/* HEADER: TITLE, FILTER & SEARCH */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
                <p className="text-xl font-medium text-gray-700">Quản Lý Tất Cả Lịch Hẹn</p>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                    {/* 2. THÊM Ô INPUT CHỌN NGÀY VÀO ĐÂY */}
                    <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-primary cursor-pointer bg-white text-gray-600"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate("")} // Reset ngày về rỗng
                            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                            title="Xóa lọc ngày"
                        >
                            ✕
                        </button>
                    )}
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-primary cursor-pointer bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">⏳ Chờ xác nhận</option>
                        <option value="approved">✅ Đã xác nhận</option>
                        <option value="completed">🎉 Hoàn thành</option>
                        <option value="cancelled">❌ Đã hủy</option>
                    </select>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm tên BS hoặc BN..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-primary transition-all shadow-sm"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

                {/* TABLE HEADER */}
                <div className="hidden sm:grid grid-cols-[0.5fr_2fr_0.5fr_2fr_1.5fr_2fr_1fr_1.5fr_0.5fr] grid-flow-col py-4 px-6 bg-gray-50 border-b font-semibold text-gray-600 text-sm">
                    <p>#</p>
                    <p>Bệnh nhân</p>
                    <p>Tuổi</p>
                    <p>Lịch khám</p>
                    <p>Ngày đặt</p>
                    <p>Bác sĩ</p>
                    <p>Phí</p>
                    <p>Trạng thái</p>
                    <p className="text-center">Xóa</p>
                </div>

                {/* LIST ITEMS */}
                <div className="min-h-[50vh]">
                    {currentItems.length > 0 ? currentItems.map((item, index) => (
                        <div className="flex flex-wrap justify-between max-sm:gap-4 sm:grid sm:grid-cols-[0.5fr_2fr_0.5fr_2fr_1.5fr_2fr_1fr_1.5fr_0.5fr] items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50 transition-colors text-sm" key={item._id}>

                            <p className="max-sm:hidden">{indexOfFirstItem + index + 1}</p>

                            {/* Bệnh nhân */}
                            <div className="flex items-center gap-3">
                                <img className="w-9 h-9 rounded-full object-cover border" src={item.userData.image} alt="" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800 truncate max-w-[120px]" title={item.userData.name}>{item.userData.name}</span>
                                    <span className="text-[10px] text-gray-400">{item.payment ? 'Đã TT online' : (item.paymentMethod === 'ONLINE' ? 'Chờ TT Online' : 'Tiền mặt')}</span>
                                </div>
                            </div>

                            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>

                            {/* Thời gian khám */}
                            <div>
                                <p className="font-medium text-gray-800">{slotDateFormat(item.slotDate)}</p>
                                <p className="text-xs text-gray-500">{item.slotTime}</p>
                            </div>

                            {/* Ngày tạo đơn */}
                            <p className="text-xs text-gray-500">{(new Date(item.date)).toLocaleDateString('vi-VN')}</p>

                            {/* Bác sĩ phụ trách */}
                            <div className="flex items-center gap-2">
                                <img className="w-6 h-6 rounded-full bg-gray-200 border" src={item.docData.image} alt="" />
                                <p className="truncate max-w-[120px]" title={item.docData.name}>{item.docData.name}</p>
                            </div>

                            <p className="font-medium">{new Intl.NumberFormat('vi-VN').format(item.amount)} {currency}</p>

                            {/* --- CỘT TRẠNG THÁI --- */}
                            <div>
                                {item.cancelled ? (
                                    <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-medium border border-red-100 flex items-center gap-1 w-fit">
                                        ❌ Đã hủy
                                    </span>
                                ) : item.isCompleted ? (
                                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-100 flex items-center gap-1 w-fit">
                                        🎉 Hoàn thành
                                    </span>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <div className="relative group w-fit">
                                            <select
                                                className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border outline-none cursor-pointer transition-all
                                    ${item.isApproved
                                                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300'
                                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:border-yellow-300'}`}
                                                onChange={(e) => handleStatusChange(e, item)}
                                                value={item.isApproved ? "approved" : "pending"}
                                            >
                                                <option value="pending">⏳ Chờ xác nhận</option>
                                                <option value="approved">✅ Đã xác nhận</option>
                                                <option value="completed">🎉 Hoàn thành</option>
                                                <option value="cancelled">❌ Hủy lịch</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Nhắc nhở check ngân hàng */}
                                        {item.paymentMethod === 'ONLINE' && !item.payment && !item.isApproved && (
                                            <span className="text-[10px] text-orange-500 font-medium italic ml-1">
                                                *Check ngân hàng trước
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Nút Xóa */}
                            <div className="text-center">
                                <button
                                    onClick={() => { if (window.confirm("Bạn có chắc muốn xóa lịch sử cuộc hẹn này vĩnh viễn?")) deleteAppointment(item._id) }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    title="Xóa vĩnh viễn"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>

                        </div>
                    )) : (
                        <div className="flex flex-col justify-center items-center h-60 text-gray-400">
                            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Không tìm thấy lịch hẹn phù hợp.</p>
                        </div>
                    )}
                </div>

                {/* FOOTER: PHÂN TRANG */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Hiển thị {currentItems.length} trên tổng {filteredList.length} lịch hẹn
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm transition-colors"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 text-sm font-medium bg-white border rounded">{currentPage} / {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AllAppointment;