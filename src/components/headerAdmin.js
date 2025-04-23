import React from "react";
import { FiSearch } from "react-icons/fi"; // Feather search icon
import logo from "../assets/images/logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-[#d2e3d0] p-4 shadow-md">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-1/2">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
          />
        </div>
      </div>

      {/* Logo and Branding */}
      <div className="flex items-center gap-2 pr-4">
        <img src={logo} alt="Heatn' Eat logo" className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-gray-800">Heatn’ Eat</h1>
      </div>
    </header>
  );
};

export default Header;
