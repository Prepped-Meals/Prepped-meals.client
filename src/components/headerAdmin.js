import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import logo from "../assets/images/logo.png";
import { ROUTES } from "../routes/paths"; 

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: ROUTES.DASHBOARD_ADMIN },
    { name: "Orders", path: ROUTES.ADMIN_ORDERS },
    { name: "Meals", path: ROUTES.MEALS_ADMIN },
    { name: "Customers", path: ROUTES.CUSTOMER_LIST },
    { name: "Payments", path: ROUTES.ADMIN_PAYMENTS },
    { name: "Order Tracking", path: ROUTES.ORDER_TRACKING },
    { name: "Feedback", path: ROUTES.ADMIN_FEEDBACK },
  ];

  const handleSelect = (path) => {
    setSearchTerm("");
    setShowSuggestions(false);
    navigate(path);
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightMatch = (text) => {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <span className="font-bold text-green-700">
          {text.substring(index, index + searchTerm.length)}
        </span>
        {text.substring(index + searchTerm.length)}
      </>
    );
  };

  return (
    <header className="flex items-center justify-between bg-[#d2e3d0] p-4 shadow-md relative">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-1/2">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg" />
          {searchTerm && (
            <FiX
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg cursor-pointer"
              onClick={() => {
                setSearchTerm("");
                setShowSuggestions(false);
              }}
            />
          )}
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredItems.length > 0) {
                handleSelect(filteredItems[0].path);
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none"
          />
          {showSuggestions && searchTerm && (
            <ul className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded-md shadow">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <li
                    key={item.name}
                    onClick={() => handleSelect(item.path)}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm"
                  >
                    {highlightMatch(item.name)}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500 italic">No matching pages</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Logo and Branding */}
      <div className="flex items-center gap-2 pr-4">
        <img src={logo} alt="Heatn’ Eat logo" className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-gray-800">Heatn’ Eat</h1>
      </div>
    </header>
  );
};

export default Header;
