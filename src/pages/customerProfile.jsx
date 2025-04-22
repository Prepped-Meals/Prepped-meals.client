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

  //Function to fetch the user's profile data from the server
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        credentials: 'include',
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      const profilePicPath = data.profile_pic
        ? `http://localhost:8000${data.profile_pic}` //Handling the profile pic URL
        : 'http://localhost:8000/uploads/user.png'; // Default profile picture if none exists


      //Setting the profile data from the fetched response
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

  //Handler to update the profile data state
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
      //Update profile details (except profile picture)
      await fetch("http://localhost:8000/api/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          f_name: profileData.firstName,
          l_name: profileData.lastName,
          contact_no: profileData.phoneNumber,
          email: profileData.email,
        }),
      });

      //If a new profile picture is selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_pic', selectedFile);

        //Upload the profile picture to the server
        await fetch("http://localhost:8000/api/customers/me/profile-pic", {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      }

      alert("Profile updated successfully!");
      setIsEditing(false); //Disable edit mode after saving
      fetchProfile();
    } catch (err) {
      console.error(err.message);
      alert("Failed to update profile.");
    }
  };

  //Handler to change the profile picture
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setProfileData({ ...profileData, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  //Handler to delete the account
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
      logout(); // Log out the user after account deletion
    } catch (err) {
      console.error(err.message);
      alert("Could not delete account.");
    }
  };

  return (
    <div className="bg-[#FCFCF9] min-h-screen">
      <h2 className="text-4xl font-bold text-[#243423] mt-10 ml-10 border-b-4 border-[#24342344]">My Account</h2>
      <div className="max-w-xl mx-auto mt-10 p-6 bg-[#E5ECE2] rounded-1xl shadow-lg">
        <div className="flex flex-col items-center">
          <img
            src={profileData.profilePic || 'http://localhost:8000/uploads/user.png'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "http://localhost:8000/uploads/user.png";
            }}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover"
          />
          <h3 className="text-xl font-semibold mt-2 text-[#243423]">
            {profileData.firstName} {profileData.lastName}
          </h3>
          {isEditing && (
            <div className="mt-4">
              <input type="file" accept="image/*" onChange={handleProfilePicChange} className="mt-2 p-2" />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {["firstName", "lastName", "phoneNumber", "email"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-[#243423]">
                {field === "firstName" ? "First Name" :
                 field === "lastName" ? "Last Name" :
                 field === "phoneNumber" ? "Phone Number" : "Email Address"}
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
              disabled
              className="mt-1 p-2 w-full border rounded-lg bg-gray-100"
            />
          </div>

          <div className="flex justify-center gap-4 mt-4">
            {!isEditing ? (
              <Button onClick={handleEdit} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">Edit</Button>
            ) : (
              <Button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">Save</Button>
            )}
            <Button onClick={handleDeleteAccount} className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
