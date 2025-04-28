import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import Header from '../components/headerAdmin';
import feedbackBackground from '../assets/images/bg.jpg';

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

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading feedback...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main content with background image */}
        <div
          className="flex-1 p-8 overflow-y-auto bg-cover bg-center"
          style={{ backgroundImage: `url(${feedbackBackground})` }}
        >
          {/* Overlay to make it slightly dark for readability */}
          <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Customer Feedback</h1>

            <div className="space-y-6">
              {feedbacks.length === 0 ? (
                <p className="text-center text-gray-600">No feedback available</p>
              ) : (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.feedback_id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Feedback ID:</p>
                        <p className="font-semibold text-indigo-600">{feedback.feedback_id}</p>
                      </div>

                      {feedback.customer && (
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Customer:</p>
                          <p className="font-semibold text-gray-800">
                            {feedback.customer.name}
                          </p>
                          <p className="text-xs text-gray-500">{feedback.customer.email}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-700">{feedback.feedback_description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
