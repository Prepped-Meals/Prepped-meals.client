import React, { useState, useEffect } from 'react';
import Button from "../components/button.js";
import { useAuth } from "../context/authContext"; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CALORIE_REPORT = "/calorieReport"; // Define the constant for the path

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

  const [errors, setErrors] = useState({});
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const { logout } = useAuth(); 
  const navigate = useNavigate(); // Initialize useNavigate hook

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

  //validations
  const validateFields = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) newErrors.firstName = "This field is required";
    if (!profileData.lastName.trim()) newErrors.lastName = "This field is required";

    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = "This field is required";
    } else if (!/^\d{10}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "This field is required";
    } else if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setAttemptedSave(false);
    setErrors({});
  };

  const handleSave = async () => {
    setAttemptedSave(true);
    if (!validateFields()) return;

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
      setAttemptedSave(false);
      setErrors({});
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

  // Modal handlers
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleReportOption = (reportType) => {
    console.log("Report option clicked:", reportType); // Debugging line
    if (reportType === "Calorie Consumption") {
      // Use the CALORIE_REPORT constant for the path
      navigate(CALORIE_REPORT);
    }
    closeModal(); // Close the modal after selection
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
            <Button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">Reports</Button>
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
                className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 ${
                  errors[field] && attemptedSave
                    ? 'border-red-500 ring-red-300'
                    : 'focus:ring-[#1D6A26]'
                } bg-white`}
              />
              {errors[field] && attemptedSave && (
                <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-[#243423]">Username</label>
            <input
              name="username"
              value={profileData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username && attemptedSave
                  ? 'border-red-500 ring-red-300'
                  : 'focus:ring-[#1D6A26]'
              } bg-white`}
            />
            {errors.username && attemptedSave && (
              <p className="text-sm text-red-600 mt-1">{errors.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for reports */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Select a Report</h3>
            <Button
              onClick={() => handleReportOption("Calorie Consumption")}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-full mb-3"
            >
              Calorie Consumption
            </Button>
            <Button onClick={closeModal} className="w-full bg-gray-600 text-white px-4 py-2 rounded-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
