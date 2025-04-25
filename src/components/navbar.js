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
    <nav className="bg-green-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-full border-2 border-white shadow-sm" />
            <h2 className="text-2xl font-semibold tracking-wide hover:text-lime-200 transition">Heatn'Eat</h2>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center font-medium">
            <Link to={ROUTES.HOME} className="hover:text-lime-200 transition">Home</Link>
            <Link to={ROUTES.MENU} className="hover:text-lime-200 transition">Menu</Link>

            {user && (
              <>
                <Link to={ROUTES.CART} className="hover:text-lime-200 transition">Cart</Link>
                <Link to={ROUTES.MYORDERS} className="hover:text-lime-200 transition">Order</Link>
                <Link to={ROUTES.CUSTOMER_FEEDBACK} className="hover:text-lime-200 transition">Feedback</Link>
              </>
            )}

            {!user ? (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:bg-lime-600 px-4 py-1.5 rounded-md transition">Sign In</Link>
                <Link to={ROUTES.SIGN_UP} className="hover:bg-lime-600 px-4 py-1.5 rounded-md transition"> Sign Up </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <img
                  src={user.profileImage || defaultProfileImage}
                  alt="Profile"
                  className="h-10 w-10 rounded-full cursor-pointer border-2 border-white hover:scale-105 transition"
                  onClick={toggleDropdown}
                />
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur-md text-black rounded-xl shadow-xl overflow-hidden z-50">
                    <Link to={ROUTES.CUSTOMER_PROFILE} className="block px-5 py-3 hover:bg-lime-100 transition">
                      Profile
                    </Link>
                    <Link to={ROUTES.RESET_PASSWORD} className="block px-5 py-3 hover:bg-lime-100 transition">
                      Security
                    </Link>
                    <button onClick={logout} className="w-full text-left px-5 py-3 hover:bg-lime-100 transition">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>

        {/*  Nav */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 pb-5 text-lg font-medium">
            <Link to={ROUTES.HOME} className="hover:text-lime-200 transition">Home</Link>
            <Link to={ROUTES.MENU} className="hover:text-lime-200 transition">Menu</Link>

            {user ? (
              <>
                <Link to={ROUTES.CART} className="hover:text-lime-200 transition">Cart</Link>
                <Link to={ROUTES.MYORDERS} className="hover:text-lime-200 transition">Order</Link>
                <Link to={ROUTES.CUSTOMER_PROFILE} className="hover:text-lime-200 transition">Profile</Link>
                <Link to={ROUTES.RESET_PASSWORD} className="hover:text-lime-200 transition">Security</Link>
                <button onClick={logout} className="text-left hover:text-lime-200 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:text-lime-200 transition">Sign In</Link>
                <Link to={ROUTES.SIGN_UP} className="hover:text-lime-200 transition">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
