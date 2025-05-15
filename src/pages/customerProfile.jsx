import React, { useState, useEffect } from 'react';
import Button from "../components/button.js";
import { useAuth } from "../context/authContext"; 
import { useNavigate } from 'react-router-dom'; 
import { FiEdit, FiSave, FiTrash2, FiFileText, FiX, FiUser, FiPhone, FiMail } from 'react-icons/fi';

const CALORIE_REPORT = "/calorieReport"; 

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const { logout } = useAuth(); 
  const navigate = useNavigate(); 

  // Validation functions (same as SignUp)
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const validateField = (name, value) => {
    let error = '';

    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
      } else if (!/^[A-Za-z]+$/.test(value)) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name must contain only letters`;
      }
    }

    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!validateEmail(value)) error = 'Invalid email address';
    }

    if (name === 'phoneNumber') {
      if (!value.trim()) error = 'Phone number is required';
      else if (!validatePhone(value)) error = 'Phone number must be 10 digits';
    }

    if (name === 'username') {
      if (!value.trim()) error = 'Username is required';
      else if (value.length < 4) error = 'Username must be at least 4 characters';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

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

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleSave = async () => {
    // Final validation before submission
    const validationErrors = {};
    Object.entries(profileData).forEach(([name, value]) => {
      if (name !== 'profilePic') { // Skip profilePic validation
        const error = validateField(name, value);
        if (error) validationErrors[name] = error;
      }
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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

      setShowSuccess(true);
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
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Could not delete");

      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      console.error(err.message);
      alert("Could not delete account.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleReportOption = (reportType) => {
    if (reportType === "Calorie Consumption") {
      navigate(CALORIE_REPORT);
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl w-72 text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Profile updated successfully!</h2>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-800 py-6 px-8 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-green-100">Manage your account information</p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Sidebar - Profile Picture and Actions */}
            <div className="w-full md:w-1/3 bg-gradient-to-b from-green-50 to-green-100 p-6 flex flex-col items-center border-r border-green-200">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
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
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white text-sm font-medium">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePicChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-green-800">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-green-800 text-sm">@{profileData.username}</p>

              <div className="mt-6 w-full space-y-3">
                {!isEditing ? (
                  <Button 
                    onClick={handleEdit}
                    className="w-full bg-green-800 hover:bg-green-900 text-white flex items-center justify-center py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    <FiEdit className="mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSave}
                    className="w-full bg-green-800 hover:bg-green-900 text-white flex items-center justify-center py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                )}

                <Button 
                  onClick={openModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center py-2 px-4 rounded-lg transition-all text-sm"
                >
                  <FiFileText className="mr-2" />
                  View Reports
                </Button>

                <Button 
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center py-2 px-4 rounded-lg transition-all text-sm"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Right Content - Profile Details */}
            <div className="w-full md:w-2/3 p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Account Details
              </h3>

              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1 flex items-center">
                    <FiUser className="mr-2 text-green-800" />
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded-lg border text-sm ${isEditing ? 'bg-white' : 'bg-gray-50'} ${
                      errors.firstName ? 'border-red-400 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'
                    } focus:outline-none focus:ring-1`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1 flex items-center">
                    <FiUser className="mr-2 text-green-800" />
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded-lg border text-sm ${isEditing ? 'bg-white' : 'bg-gray-50'} ${
                      errors.lastName ? 'border-red-400 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'
                    } focus:outline-none focus:ring-1`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1 flex items-center">
                    <FiPhone className="mr-2 text-green-800" />
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded-lg border text-sm ${isEditing ? 'bg-white' : 'bg-gray-50'} ${
                      errors.phoneNumber ? 'border-red-400 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'
                    } focus:outline-none focus:ring-1`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1 flex items-center">
                    <FiMail className="mr-2 text-green-800" />
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded-lg border text-sm ${isEditing ? 'bg-white' : 'bg-gray-50'} ${
                      errors.email ? 'border-red-400 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'
                    } focus:outline-none focus:ring-1`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded-lg border text-sm ${isEditing ? 'bg-white' : 'bg-gray-50'} ${
                      errors.username ? 'border-red-400 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'
                    } focus:outline-none focus:ring-1`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-green-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Select a Report</h3>
              <button onClick={closeModal} className="text-white hover:text-green-200">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <Button
                onClick={() => handleReportOption("Calorie Consumption")}
                className="w-full bg-green-800 hover:bg-green-900 text-white flex items-center justify-center py-2 px-4 rounded-lg mb-3 transition-all text-sm"
              >
                <FiFileText className="mr-2" />
                Calorie Consumption Report
              </Button>
              <Button 
                onClick={closeModal} 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center py-2 px-4 rounded-lg transition-all text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to delete your account?</h2>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone. All your data will be permanently removed.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-72 text-center">
            <h2 className="text-lg font-semibold mb-4 text-green-700">Account deleted successfully!</h2>
            <button
              onClick={() => {
                setShowDeleteSuccess(false);
                logout();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;