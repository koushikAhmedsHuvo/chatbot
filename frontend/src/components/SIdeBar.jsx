// frontend/src/components/Sidebar.jsx
import useAuthUser from '../hooks/useAuthUser';
import { Link, useLocation } from 'react-router-dom';
import { LuShipWheel } from "react-icons/lu";
import { MdHome, MdPeople, MdGroups, MdNotifications, MdChat, MdSmartToy } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", icon: <MdHome className="size-5" />, label: "Home" },
    { path: "/friends", icon: <FaUserFriends className="size-5" />, label: "Friends" },
    { path: "/groups", icon: <MdGroups className="size-5" />, label: "Groups" },
    { path: "/ai-mentor", icon: <MdSmartToy className="size-5" />, label: "AI Mentor" },
    { path: "/notifications", icon: <MdNotifications className="size-5" />, label: "Notifications" },
  ];

  return (
    <aside className="w-72 bg-base-100 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3 group">
          <LuShipWheel className="size-9 text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            KYAU-CHAT
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`btn btn-ghost justify-start w-full gap-3 px-4 py-3 normal-case text-base transition-all ${
              currentPath === item.path 
                ? "bg-primary/10 text-primary border-l-4 border-primary" 
                : "hover:bg-base-200"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-base-300 bg-base-200/50">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring ring-primary/30">
              <img src={authUser?.profilePicture} alt={authUser?.fullName} className="object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <p className="text-xs text-success">Online</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          <span className="badge badge-sm badge-secondary">Native: {authUser?.nativeLanguage}</span>
          <span className="badge badge-sm badge-outline">Learning: {authUser?.learningLanguage}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;