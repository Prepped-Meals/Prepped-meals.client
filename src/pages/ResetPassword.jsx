import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-96 bg-green-100 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-semibold">Reset Password</h2>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                className="w-full p-2 border rounded bg-green-50 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("current")}
              >
                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                className="w-full p-2 border rounded bg-green-50 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("new")}
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                className="w-full p-2 border rounded bg-green-50 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("confirm")}
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;