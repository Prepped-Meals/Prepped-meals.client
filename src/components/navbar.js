import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiMenu, 
  FiX, 
  FiShoppingCart, 
  FiUser, 
  FiLock, 
  FiLogOut,
  FiHome,
  FiBook,
  FiPackage,
  FiMessageSquare
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/images/logo.png";
import { ROUTES } from "../routes/paths";
import { useAuth } from "../context/authContext";
import defaultProfileImage from "../assets/images/user.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  // Nav items data
  const navItems = [
    { path: ROUTES.HOME, label: "Home", icon: <FiHome className="mr-1" /> },
    { path: ROUTES.MENU, label: "Menu", icon: <FiBook className="mr-1" /> },
    ...(user
      ? [
          { path: ROUTES.CART, label: "Cart", icon: <FiShoppingCart className="mr-1" /> },
          { path: ROUTES.MYORDERS, label: "Orders", icon: <FiPackage className="mr-1" /> },
          { path: ROUTES.CUSTOMER_FEEDBACK, label: "Feedback", icon: <FiMessageSquare className="mr-1" /> },
        ]
      : []),
  ];

  const dropdownItems = [
    { path: ROUTES.CUSTOMER_PROFILE, label: "Profile", icon: <FiUser className="mr-2" /> },
    { path: ROUTES.RESET_PASSWORD, label: "Security", icon: <FiLock className="mr-2" /> },
    { action: handleLogout, label: "Logout", icon: <FiLogOut className="mr-2" /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full border-2 border-white shadow-md"
            />
            <motion.h2
              className="text-2xl font-bold tracking-tight font-serif"
              whileHover={{ scale: 1.05 }}
            >
              Heatn'Eat
            </motion.h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-1 py-2 text-sm font-medium rounded-md transition-all ${
                  location.pathname === item.path
                    ? "text-white border-b-2 border-lime-300"
                    : "text-white/90 hover:text-white hover:scale-105"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {!user ? (
              <div className="flex space-x-4 ml-4">
                <Link
                  to={ROUTES.SIGN_IN}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.SIGN_UP}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.profileImage || defaultProfileImage}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border-2 border-white hover:scale-105 transition-transform"
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {dropdownItems.map((item) =>
                        item.path ? (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-4 py-3 hover:bg-green-100 transition-colors"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="w-full flex items-center px-4 py-3 hover:bg-green-100 transition-colors text-left"
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/20 focus:outline-none transition-all"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-green-700/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? "bg-green-600 text-white"
                      : "text-white/90 hover:bg-green-600/50 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {user ? (
                dropdownItems.map((item) =>
                  item.path ? (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-green-600/50 hover:text-white"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-green-600/50 hover:text-white text-left"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  )
                )
              ) : (
                <>
                  <Link
                    to={ROUTES.SIGN_IN}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-green-600/50 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={ROUTES.SIGN_UP}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-green-600/50 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl p-6 w-80 text-center"
            >
              <h2 className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to logout?</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FiLogOut className="mr-2" />
                  Yes
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-green-600 rounded-md hover:bg-gray-300 transition-colors"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;