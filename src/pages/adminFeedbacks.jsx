import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import Header from '../components/headerAdmin';
import { FiMessageSquare, FiUser, FiMail, FiClock, FiAlertCircle, FiTrash2, FiStar } from 'react-icons/fi';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/feedback', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch feedbacks');
        }

        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleDeleteClick = (id) => {
    setFeedbackToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/feedback/${feedbackToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error("Failed to delete feedback");
      }

      setFeedbacks((prev) => prev.filter((feedback) => feedback._id !== feedbackToDelete));
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
      setFeedbackToDelete(null);
    } catch (err) {
      alert("Error deleting feedback: " + err.message);
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
    }
  };

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full border-l-4 border-red-500">
            <div className="flex items-start">
              <FiAlertCircle className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-800 mb-1">Error Loading Feedback</h3>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {feedbacks.length} {feedbacks.length === 1 ? 'Feedback' : 'Feedbacks'}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <FiMessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">All Feedback</h2>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <FiMessageSquare className="w-full h-full opacity-50" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No feedback yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Customer feedback will appear here once submitted.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <li key={feedback._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-6 py-5">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                ID: {feedback.feedback_id}
                              </span>
                              {feedback.createdAt && (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <FiClock className="mr-1" />
                                  {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Rating Display */}
                            {feedback.rating && (
                              <div className="flex items-center mb-2">
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      className={
                                        star <= feedback.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300'
                                      }
                                      size={16}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {feedback.rating} out of 5
                                </span>
                              </div>
                            )}

                            <div className="text-sm text-gray-700 whitespace-pre-line mb-2">
                              {feedback.feedback_description}
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(feedback._id)}
                              className="inline-flex items-center text-sm text-red-600 hover:underline"
                            >
                              <FiTrash2 className="mr-1" />
                              Delete
                            </button>
                          </div>

                          {feedback.customer && (
                            <div className="md:w-56 flex-shrink-0">
                              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                                  <FiUser className="mr-1" />
                                  Customer
                                </h4>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {feedback.customer.f_name} {feedback.customer.l_name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                  <FiMail className="mr-1" />
                                  <span className="truncate">{feedback.customer.email}</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to delete this feedback?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFeedbackToDelete(null);
                }}
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
            <h2 className="text-lg font-semibold mb-4 text-green-700">Feedback deleted successfully!</h2>
            <button
              onClick={() => {
                setShowDeleteSuccess(false);
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

export default AdminFeedbackPage;