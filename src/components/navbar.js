import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/images/logo.png";

import { ROUTES } from "../routes/paths";
import { useAuth } from "../context/authContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-green-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <img
              src={logo}
              alt="Heatn'Eat Logo"
              className="h-12 w-12 rounded-full"
            />
            <h2 className="text-xl font-bold">Heatn'Eat</h2>
          </Link>

          <div className="hidden md:flex gap-6">
            <Link to={ROUTES.HOME} className="hover:text-gray-300">
              Home
            </Link>
            <Link to={ROUTES.MENU} className="hover:text-gray-300">
              Menu
            </Link>
            {user && (
              <>
                <Link to={ROUTES.CART} className="hover:text-gray-300">
                  Cart
                </Link>
                <Link to={ROUTES.PAYMENT} className="hover:text-gray-300">
                  Payment
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:text-gray-300">
                  Sign In
                </Link>
                <Link to={ROUTES.SIGN_UP} className="hover:text-gray-300">
                  Sign Up
                </Link>
              </>
            ) : (
              <button onClick={logout} className="hover:text-gray-300">
                Logout
              </button>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 pb-4">
            <Link to={ROUTES.HOME} className="hover:text-gray-300">
              Home
            </Link>
            <Link to={ROUTES.MENU} className="hover:text-gray-300">
              Menu
            </Link>
            {user && (
              <>
                <Link to={ROUTES.CART} className="hover:text-gray-300">
                  Cart
                </Link>
                <Link to={ROUTES.PAYMENT} className="hover:text-gray-300">
                  Payment
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link to={ROUTES.SIGN_IN} className="hover:text-gray-300">
                  Sign In
                </Link>
                <Link to={ROUTES.SIGN_UP} className="hover:text-gray-300">
                  Sign Up
                </Link>
              </>
            ) : (
              <button onClick={logout} className="hover:text-gray-300">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
