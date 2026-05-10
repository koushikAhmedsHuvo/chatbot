// frontend/src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { LuShipWheel } from "react-icons/lu";
import { FaBell, FaUsers, FaRobot, FaUserFriends, FaSignOutAlt, FaHome } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useNotificationStore } from "../store/useNotificationStore";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isChatPage = location.pathname?.startsWith("/chat");
  const { unreadCount, increment, reset } = useNotificationStore();
  const { socket } = useSocket();
  const { logoutMutation } = useLogout();

  useEffect(() => {
    if (!socket) return;
    const handleGroupMsg = () => increment();
    const handlePrivateMsg = () => increment();
    socket.on("new_group_message", handleGroupMsg);
    socket.on("new_private_message", handlePrivateMsg);
    return () => {
      socket.off("new_group_message", handleGroupMsg);
      socket.off("new_private_message", handlePrivateMsg);
    };
  }, [socket, increment]);

  const handleLogout = () => {
    reset();
    logoutMutation();
    toast.success("Logged out successfully");
  };

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {isChatPage && (
            <Link to="/" className="flex items-center gap-2.5 group">
              <LuShipWheel className="size-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KYAU-CHAT
              </span>
            </Link>
          )}

          {/* Navigation Links (Center) */}
          {!isChatPage && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="btn btn-ghost btn-sm gap-2">
                <FaHome />
                Home
              </Link>
              <Link to="/friends" className="btn btn-ghost btn-sm gap-2">
                <FaUserFriends />
                Friends
              </Link>
              <Link to="/groups" className="btn btn-ghost btn-sm gap-2">
                <FaUsers />
                Groups
              </Link>
              <Link to="/ai-mentor" className="btn btn-ghost btn-sm gap-2">
                <FaRobot />
                AI Mentor
              </Link>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Groups Button (Mobile) */}
            <button
              onClick={() => navigate("/groups")}
              className="btn btn-ghost btn-circle md:hidden"
              title="Groups"
            >
              <FaUsers className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <Link to="/notifications" className="btn btn-ghost btn-circle relative">
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 badge badge-xs badge-primary animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Menu */}
            <div className="dropdown dropdown-end">
              <button 
                className="btn btn-ghost btn-circle avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-9 h-9 rounded-full ring ring-primary/20">
                  <img src={authUser?.profilePicture} alt="User Avatar" className="object-cover" />
                </div>
              </button>
              
              {showUserMenu && (
                <ul className="dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow-xl mt-2 border border-base-300" onClick={() => setShowUserMenu(false)}>
                  <li className="menu-title px-3 py-2 border-b border-base-300">
                    <span>{authUser?.fullName}</span>
                  </li>
                  <li>
                    <Link to="/friends" className="gap-3">
                      <FaUserFriends />
                      My Friends
                    </Link>
                  </li>
                  <li>
                    <Link to="/ai-mentor" className="gap-3">
                      <FaRobot />
                      AI Mentor
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="gap-3">
                      <IoSettingsOutline />
                      Settings
                    </Link>
                  </li>
                  <li className="border-t border-base-300 mt-2 pt-2">
                    <button onClick={handleLogout} className="gap-3 text-error">
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;