import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData, getUserAppointments } = useContext(AppContext);

  // State cho việc sửa profile
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- STATE MỚI CHO ĐỔI MẬT KHẨU ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Hàm cập nhật thông tin cá nhân (Giữ nguyên)
  const updateUserProfileData = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Cập nhật thông tin thành công");
        await loadUserProfileData();
        if (getUserAppointments) {
          await getUserAppointments();
        }
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- HÀM MỚI: XỬ LÝ ĐỔI MẬT KHẨU ---
  const handleChangePassword = async () => {
    // Validate cơ bản
    if (!userData.isGoogleLogin && !passwordData.oldPassword) {
        return toast.error("Vui lòng nhập mật khẩu hiện tại");
    }

    // 2. Kiểm tra Mật khẩu mới (Ai cũng phải nhập)
    // SỬA Ở ĐÂY: Xóa điều kiện check oldPassword, chỉ check newPassword
    if (!passwordData.newPassword) { 
      return toast.error("Vui lòng nhập mật khẩu mới");
    }

    // 3. Kiểm tra xác nhận mật khẩu
    if (!passwordData.confirmPassword) {
        return toast.error("Vui lòng xác nhận lại mật khẩu mới");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }

    if (passwordData.newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/change-password',
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setShowPasswordModal(false); // Đóng modal
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    userData && (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100 relative">

        {/* --- HEADER: ẢNH & TÊN --- */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {isEdit ? (
            <label htmlFor="image" className="relative cursor-pointer group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm relative">
                <img
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt="Profile"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img className="w-10 opacity-0 group-hover:opacity-100 transition-opacity" src={assets.upload_icon} alt="" />
              </div>
              <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
                <img className="w-5" src={assets.upload_icon} alt="" />
              </div>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                hidden
              />
            </label>
          ) : (
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
              <img className="w-full h-full object-cover" src={userData.image} alt="Profile" />
            </div>
          )}

          {isEdit ? (
            <input
              className="bg-gray-50 text-2xl font-bold text-center border-b-2 border-gray-300 focus:border-primary outline-none px-4 py-1 w-full max-w-sm text-gray-700"
              type="text"
              value={userData.name}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên của bạn"
            />
          ) : (
            <p className="font-bold text-2xl text-gray-800">{userData.name}</p>
          )}
        </div>

        <hr className="border-gray-200 my-6" />

        {/* --- THÔNG TIN LIÊN HỆ --- */}
        <div className="mb-6">
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-4 border-l-4 border-primary pl-2">Thông tin liên hệ</p>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-y-4 gap-x-4 items-center">
            <p className="font-medium text-gray-600">Email:</p>
            <p className="text-blue-600 font-medium truncate">{userData.email}</p>

            <p className="font-medium text-gray-600">Điện thoại:</p>
            {isEdit ? (
              <input
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full max-w-md outline-primary focus:bg-white transition-all"
                type="text"
                value={userData.phone || ""}
                onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            ) : (
              <p className="text-blue-500">{userData.phone}</p>
            )}

            <p className="font-medium text-gray-600 self-start mt-2">Địa chỉ:</p>
            {isEdit ? (
              <div className="flex flex-col gap-2 w-full max-w-md">
                <input
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full outline-primary focus:bg-white transition-all"
                  onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                  value={userData.address.line1}
                  type="text"
                  placeholder="Địa chỉ dòng 1"
                />
                <input
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full outline-primary focus:bg-white transition-all"
                  onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                  value={userData.address.line2}
                  type="text"
                  placeholder="Địa chỉ dòng 2"
                />
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>

        {/* --- THÔNG TIN CƠ BẢN --- */}
        <div>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-4 border-l-4 border-primary pl-2">Thông tin cơ bản</p>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-y-4 gap-x-4 items-center">
            <p className="font-medium text-gray-600">Giới tính:</p>
            {isEdit ? (
              <select
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-32 outline-primary focus:bg-white cursor-pointer"
                onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                value={userData.gender}
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            ) : (
              <p className="text-gray-600">
                {userData.gender === "Male" ? "Nam" : userData.gender === "Female" ? "Nữ" : userData.gender}
              </p>
            )}

            <p className="font-medium text-gray-600">Ngày sinh:</p>
            {isEdit ? (
              <input
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-40 outline-primary focus:bg-white cursor-pointer"
                type="date"
                onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                value={userData.dob}
              />
            ) : (
              <p className="text-gray-600">{userData.dob ? new Date(userData.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        {/* --- BUTTONS --- */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">

          {/* Nút Đổi mật khẩu (Chỉ hiện khi KHÔNG ở chế độ Edit) */}
          {!isEdit && (
            <button
              className="border border-gray-300 text-gray-700 px-8 py-2.5 rounded-full hover:bg-gray-50 transition-all font-medium shadow-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Đổi mật khẩu
            </button>
          )}

          {isEdit ? (
            <>
              <button
                className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-all font-medium"
                onClick={() => { setIsEdit(false); setImage(false); }}
                disabled={isUpdating}
              >
                Hủy bỏ
              </button>
              <button
                className={`bg-primary text-white px-8 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md font-medium ${isUpdating ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                onClick={updateUserProfileData}
                disabled={isUpdating}
              >
                {isUpdating ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </>
          ) : (
            <button
              className="border border-primary text-primary px-8 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all font-medium shadow-sm"
              onClick={() => setIsEdit(true)}
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>

        {/* --- MODAL / POPUP ĐỔI MẬT KHẨU --- */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Đổi mật khẩu</h3>

              <div className="flex flex-col gap-4">
                {!userData.isGoogleLogin && (
                  <div>
                    <label className="text-sm text-gray-600 font-medium mb-1 block">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-primary"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600 font-medium mb-1 block">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-primary"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium mb-1 block">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-primary"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium"
                  onClick={handleChangePassword}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  );
};

export default MyProfile;