import React from 'react';

const ActionAlert = ({
  type = "success",
  message,
  onClose,
  showCancel = false,
  onCancel,
}) => {
  const baseStyles = "fixed inset-0 flex items-center justify-center z-50 bg-black/25";
  const cardStyles = "bg-white rounded-xl shadow-xl w-full max-w-sm border-2 overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100";

  const accentColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-400",
    info: "bg-blue-500"
  };

  const borderColors = {
    success: "border-green-500",
    error: "border-red-500",
    warning: "border-amber-400",
    info: "border-blue-500"
  };

  return (
    <div className={baseStyles}>
      <div className={`${cardStyles} ${borderColors[type]}`}>
        {/* Colored header bar */}
        <div className={`h-1.5 w-full ${accentColors[type]}`} />

        <div className="p-6 space-y-5">
          <p className="text-gray-800 font-medium text-center text-lg">{message}</p>

          <div className="flex justify-center gap-4">
            {showCancel && (
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 ${
                type === 'warning'
                  ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200'
                  : type === 'error'
                  ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-200'
                  : type === 'info'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-200'
                  : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-200'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionAlert;
