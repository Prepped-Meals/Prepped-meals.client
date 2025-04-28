import {Link} from "react-router-dom";
import {useState} from "react";
import {FiHome, FiHeart, FiClipboard,FiUsers,FiLogOut , FiMessageCircle } from "react-icons/fi";
import profilePic from '../assets/images/pro.png';
import { ROUTES } from "../routes/paths";


const SidebarAdmin = () => {
    const [profileImage, setProfileImage] = useState(profilePic);

    const menuItems = [
        {name : "Dashboard", icon: <FiHome size= {20}/>, path: ROUTES.DASHBOARD_ADMIN},
        {name: "Orders", icon:<FiClipboard size={20}/>, path: ROUTES.ADMIN_ORDERS},
        {name: "Meals", icon: <FiHeart size={20}/>, path: ROUTES.MEALS_ADMIN},
        {name: "Customers", icon: <FiUsers size={20}/>, path:ROUTES.ADMIN_CUSTOMER},
        {name: "Feedback", icon: <FiMessageCircle size={20}/>, path: ROUTES.ADMIN_FEEDBACK},
        {name: "Logout", icon: <FiLogOut  size={20}/>, path:ROUTES.LOGOUT_ADMIN},

    ];

  //handle image upload
  const handleImageChange =(e) =>{
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => setProfileImage (reader.result);
      reader.readAsDataURL (file);
    }
  };


return (
  <div className="h-screen w-64 bg-green-100 p-4 flex flex-col items-center">
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
        <Link
          key={item.name}
          to={item.path}
          className="flex items-center gap-2 p-3 w-full hover:bg-gray-300 rounded-lg transition"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-sm font-semibold">{item.name}</span>
        </Link>
      ))}
    </nav>
  </div>
);
};


export default SidebarAdmin;