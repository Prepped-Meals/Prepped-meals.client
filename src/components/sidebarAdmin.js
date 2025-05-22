import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FiHome,
  FiHeart,
  FiClipboard,
  FiUsers,
  FiLogOut,
  FiMessageCircle,
  FiCreditCard,
  FiPackage,
} from "react-icons/fi";
import profilePic from "../assets/images/pro.png";
import { ROUTES } from "../routes/paths";

const SidebarAdmin = () => {
  const [profileImage, setProfileImage] = useState(profilePic);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FiHome size={20} />, path: ROUTES.DASHBOARD_ADMIN },
    { name: "Orders", icon: <FiClipboard size={20} />, path: ROUTES.ADMIN_ORDERS },
    { name: "Meals", icon: <FiHeart size={20} />, path: ROUTES.MEALS_ADMIN },
    { name: "Customers", icon: <FiUsers size={20} />, path: ROUTES.CUSTOMER_LIST },
    { name: "Payments", icon: <FiCreditCard size={20} />, path: ROUTES.ADMIN_PAYMENTS },
    { name: "Order Tracking", icon: <FiPackage size={20} />, path: ROUTES.ORDER_TRACKING },
    { name: "Feedback", icon: <FiMessageCircle size={20} />, path: ROUTES.ADMIN_FEEDBACK },
    { name: "Logout", icon: <FiLogOut size={20} />, path: "#", action: () => setShowLogoutConfirm(true) },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = (item) => {
    if (item.action) {
      item.action();
    }
  };

  return (
    <div className="relative">
      {/* Blur overlay when modal is shown */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 backdrop-blur-none bg-black bg-opacity-20 z-20 pointer-events-none rounded-md" />
      )}

      <div
        className="sticky top-0 bg-[#d2e3d0] p-4 flex flex-col items-center z-10"
        style={{ height: "100vh", overflowY: "auto", minHeight: "100px", width: "16rem" }}
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <label htmlFor="profile-upload" className="cursor-pointer">
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-full mb-2 w-20 h-20 object-cover border-2 border-gray-400 hover:opacity-80 transition"
            />
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          <h2 className="font-bold text-lg">Admin</h2>
        </div>

        {/* Divider */}
        <div className="w-full border-b border-gray-400 mb-4"></div>

        {/* Navigation Menu */}
        <nav className="w-full">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleLogoutClick(item)}
              className="flex items-center gap-2 p-3 w-full hover:bg-gray-300 rounded-lg transition cursor-pointer"
            >
              <span className="text-xl">{item.icon}</span>
              {item.path !== "#" ? (
                <Link to={item.path} className="text-sm font-semibold w-full">
                  {item.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold">{item.name}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Are you sure you want to logout?
              </h2>
              <div className="flex justify-center gap-4">
                <Link
                  to={ROUTES.LOGOUT_ADMIN}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Yes
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarAdmin;
