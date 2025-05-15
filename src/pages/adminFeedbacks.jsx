import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import Header from '../components/headerAdmin';
import { FiMessageSquare, FiUser, FiMail, FiClock, FiAlertCircle } from 'react-icons/fi';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (isLoading) return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md w-full">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Loading Feedback</h3>
            <p className="text-gray-500">Please wait while we fetch the latest feedback</p>
          </div>
        </div>
      </div>
    </div>
  );

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
      {/* Sidebar */}
      <SidebarAdmin />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Page Header */}
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

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Feedback List Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <FiMessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">All Feedback</h2>
                </div>
              </div>

              {/* Feedback List */}
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
                    <li key={feedback.feedback_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-6 py-5">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                          {/* Feedback Content */}
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
                            
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              {feedback.feedback_description}
                            </div>
                          </div>

                          {/* Customer Info */}
                          {feedback.customer && (
                            <div className="md:w-56 flex-shrink-0">
                              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                                  <FiUser className="mr-1" />
                                  Customer
                                </h4>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {feedback.customer.name}
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
    </div>
  );
};

export default AdminFeedbackPage;