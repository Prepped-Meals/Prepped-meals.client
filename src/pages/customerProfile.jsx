import React, {useState} from 'react';
import Button from "../components/button.js";


const CustomerProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName : '',
        lastName : '',
        phoneNumber : '',
        email: '',
        username: '',
        profilePic: '/profile.jpg'

        
    });

    const handleChange = (e) => {
        const {name,value} = e.target;
        setProfileData({...profileData, [name]: value});
    };

    const handleEdit = () => setIsEditing(true);
    const handleSave = () => setIsEditing(false);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfileData({...profileData, profilePic: reader.result});
            reader.readAsDataURL(file);
        }    
    
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
        if (confirmDelete) {
          console.log("Account deleted"); 
        }
      };


    return(
        <div className = "bg-[#FCFCF9] min-h-screen">

        {/* Title */}

        <h2 className ="text-4xl font-bold text-[#243423] mt-10 ml-10 border-b-4 max border-[#24342344]"> My Account</h2>

        {/*profile section*/}

        <div className="max-w-xl mx-auto mt-10 p-6 bg-[#E5ECE2] rounded-1xl shadow-lg">
        <div className="flex flex-col items-center">
        <img src="profileData.profilePic" alt="profile" className="w-28 h-28 rounded-full object-cover" />
        <h3 className="text-xl font-semibold mt-2 text-[#243423]">{profileData.firstName} {profileData.lastName}</h3>

        {isEditing && (
            <div className="mt-4">
              <input type="file" accept="image/*" onChange={handleProfilePicChange} id ="profile-upload" className="mt-2 p-2" />
            </div>
        )}

        </div>

        
        <div className = "mt-6 space-y-6">
            <div>
                <label className = "text-sm font-medium text-[#243423]">First Name</label>
                <input name = "firstName" value={profileData.firstName} onChange={handleChange} disabled ={!isEditing} className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"/>
            </div>

            <div>
                <label className = "text-sm font-medium text-[#243423]">Last Name</label>
                <input name = "lastName" value={profileData.lastName} onChange={handleChange} disabled ={!isEditing} className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"/>
            </div>

            <div>
                <label className = "text-sm font-medium text-[#243423]">Phone Number</label>
                <input name = "phoneNumber" value={profileData.phoneNumber} onChange={handleChange} disabled ={!isEditing} className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"/>
            </div>

            <div>
                <label className = "text-sm font-medium text-[#243423]">Email Address</label>
                <input name = "email" value={profileData.email} onChange={handleChange} disabled ={!isEditing} className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"/>
            </div>

            <div>
                <label className = "text-sm font-medium text-[#243423]">Username</label>
                <input name = "username" value={profileData.username} onChange={handleChange} disabled ={!isEditing} className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"/>
            </div>

            <div className="flex justify-center gap-4 mt-4">
            <Button onClick={handleEdit} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">Edit</Button>
            <Button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">Save</Button>
            <Button onClick={handleDeleteAccount} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">Delete Account</Button>
            </div>

        </div>

        </div>

        </div>
    );
};

export default CustomerProfile;