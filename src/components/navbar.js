// src/components/NavBar.js
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/images/logo.png";
import { ROUTES } from "../routes/paths";
import { useAuth } from "../context/authContext";
import defaultProfileImage from "../assets/images/user.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-green-900 text-white shadow-lg relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <img src={logo} alt="Heatn'Eat Logo" className="h-12 w-12 rounded-full" />
            <h2 className="text-xl font-bold">Heatn'Eat</h2>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to={ROUTES.HOME} className="hover:text-gray-300">Home</Link>
            <Link to={ROUTES.MENU} className="hover:text-gray-300">Menu</Link>

            {user && (
              <>
                <Link to={ROUTES.CART} className="hover:text-gray-300">Cart</Link>
                <Link to="/order-history" className="hover:text-gray-300">Order</Link>
              </>
            )}

            {!user ? (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:text-gray-300">Sign In</Link>
                <Link to={ROUTES.SIGN_UP} className="hover:text-gray-300">Sign Up</Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <img
                  src={user.profileImage || defaultProfileImage}
                  alt="Profile"
                  className="h-9 w-9 rounded-full cursor-pointer border-2 border-white"
                  onClick={toggleDropdown}
                />
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
                    <Link to={ROUTES.CUSTOMER_PROFILE} className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to={ROUTES.RESET_PASSWORD} className="block px-4 py-2 hover:bg-gray-100">
                      Security
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 pb-4">
            <Link to={ROUTES.HOME} className="hover:text-gray-300">Home</Link>
            <Link to={ROUTES.MENU} className="hover:text-gray-300">Menu</Link>

            {user ? (
              <>
                <Link to={ROUTES.CART} className="hover:text-gray-300">Cart</Link>
                <Link to="/order-history" className="hover:text-gray-300">Order</Link>
                <Link to={ROUTES.CUSTOMER_PROFILE} className="hover:text-gray-300">Profile</Link>
                <Link to={ROUTES.RESET_PASSWORD} className="hover:text-gray-300">Security</Link>
                <button onClick={logout} className="text-left hover:text-gray-300">Logout</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:text-gray-300">Sign In</Link>
                <Link to={ROUTES.SIGN_UP} className="hover:text-gray-300">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
