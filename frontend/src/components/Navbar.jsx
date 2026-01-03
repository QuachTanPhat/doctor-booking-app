import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt=""
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">TRANG CHỦ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">DANH SÁCH BÁC SĨ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">GIỚI THIỆU</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">LIÊN HỆ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={userData.image}
              alt=""
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />

            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-64 bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-gray-900 font-bold truncate">
                    {userData.name}
                  </p>
                  <p className="text-gray-500 text-sm font-normal truncate">
                    {userData.email}
                  </p>
                </div>

                <div className="p-2 flex flex-col gap-1">
                  <div
                    onClick={() => navigate("my-profile")}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    <p className="text-gray-700 text-sm">Hồ sơ cá nhân</p>
                  </div>

                  <div
                    onClick={() => navigate("my-appointments")}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <p className="text-gray-700 text-sm">Lịch hẹn của tôi</p>
                  </div>

                  <div
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 cursor-pointer rounded-md transition-colors group/item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-red-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                      />
                    </svg>
                    <p className="text-red-500 text-sm font-medium">
                      Đăng xuất
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
             {/* --- NÚT ĐĂNG KÝ (Mới thêm) --- */}
            <button
              onClick={() => navigate("/login", { state: { openSignUp: true } })}
              
              className="bg-white text-primary border border-primary px-8 py-3 rounded-full font-light hover:bg-gray-50 transition-all"
            >
              Đăng ký
            </button>
            
            {/* --- NÚT ĐĂNG NHẬP (Giữ nguyên) --- */}
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-8 py-3 rounded-full font-light hover:bg-primary/90 transition-all"
            >
              Đăng nhập
            </button>
          </div>
        )}

        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />

        <div
          className={` ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo2} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">TRANG CHỦ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">DANH SÁCH BÁC SĨ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">GIỚI THIỆU</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">LIÊN HỆ</p>
            </NavLink>
            {/* Nút Đăng nhập/Đăng ký trên Mobile */}
            {!token && (
               <div className="flex flex-col gap-2 mt-4 w-full px-10">
                   <button onClick={() => {navigate("/login"); setShowMenu(false)}} className="w-full py-2 border border-primary text-primary rounded-full">Đăng ký</button>
                   <button onClick={() => {navigate("/login"); setShowMenu(false)}} className="w-full py-2 bg-primary text-white rounded-full">Đăng nhập</button>
               </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;