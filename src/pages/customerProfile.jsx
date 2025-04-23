import React, { useState, useEffect } from 'react';
import Button from "../components/button.js";
import { useAuth } from "../context/authContext"; 

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    username: '',
    profilePic: '',
  });

  const { logout } = useAuth(); 

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        credentials: 'include',
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      const profilePicPath = data.profile_pic
        ? `http://localhost:8000${data.profile_pic}`
        : 'http://localhost:8000/uploads/user.png';

      setProfileData({
        firstName: data.f_name || '',
        lastName: data.l_name || '',
        phoneNumber: data.contact_no || '',
        email: data.email || '',
        username: data.username || '',
        profilePic: profilePicPath,
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await fetch("http://localhost:8000/api/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          f_name: profileData.firstName,
          l_name: profileData.lastName,
          contact_no: profileData.phoneNumber,
          email: profileData.email,
          username: profileData.username,
        }),
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_pic', selectedFile);

        await fetch("http://localhost:8000/api/customers/me/profile-pic", {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      }

      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err.message);
      alert("Failed to update profile.");
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setProfileData({ ...profileData, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Could not delete");

      alert("Account deleted successfully.");
      logout();
    } catch (err) {
      console.error(err.message);
      alert("Could not delete account.");
    }
  };

  return (
    <div className="bg-[#f5f7f3] min-h-screen flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-1/3 bg-gradient-to-br from-[#E5ECE2] to-[#d2e1cd] flex flex-col items-center py-10 px-4 relative z-10">
          <div className="w-24 h-24 rounded-full bg-white shadow-md overflow-hidden">
            <img
              src={profileData.profilePic || 'http://localhost:8000/uploads/user.png'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "http://localhost:8000/uploads/user.png";
              }}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-bold mt-4 text-[#243423]">
            Welcome {profileData.firstName}
          </h3>
          {isEditing && (
            <div className="mt-4">
              <input type="file" accept="image/*" onChange={handleProfilePicChange} className="mt-2 p-2 text-sm" />
            </div>
          )}
          <div className="flex flex-col gap-3 mt-6 w-full px-6">
            {!isEditing ? (
              <Button onClick={handleEdit} className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700">Edit</Button>
            ) : (
              <Button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700">Save</Button>
            )}
            <Button onClick={handleDeleteAccount} className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">Delete Account</Button>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-8 space-y-6 bg-[#fcfcf9]">
          {['firstName', 'lastName', 'phoneNumber', 'email'].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-[#243423]">
                {field === 'firstName' ? 'First Name' :
                 field === 'lastName' ? 'Last Name' :
                 field === 'phoneNumber' ? 'Phone Number' : 'Email Address'}
              </label>
              <input
                name={field}
                value={profileData[field]}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6A26] bg-white"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-[#243423]">Username</label>
            <input
              name="username"
              value={profileData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 p-2 w-full border rounded-lg bg-gray-100"
            />
          </div>
        </div>

        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#d0e8c3] rounded-full opacity-50 -z-10"></div>
        <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-[#e4f0d8] rounded-full opacity-50 -z-10"></div>
      </div>
    </div>
  );
};

export default CustomerProfile;
