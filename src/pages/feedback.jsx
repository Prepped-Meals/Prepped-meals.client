import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiThumbsUp, FiSend, FiUser } from 'react-icons/fi';
import feedbackBg from '../assets/images/feedbackbg.jpeg';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
    fetchCurrentUser();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/feedback', {
        credentials: 'include',
      });
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/customers/me', {
        credentials: 'include',
      });
      const data = await res.json();
      setCurrentUserId(data._id);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsError(false);

    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      setStatus('Feedback cannot be empty.');
      setIsError(true);
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:8000/api/feedback/${editingId}`
        : 'http://localhost:8000/api/feedback';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback_description: feedback }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback('');
        setEditingId(null);
        setStatus(editingId ? 'Feedback updated!' : 'Thank you for your feedback!');
        setIsError(false);
        fetchFeedbacks();
      } else {
        setStatus(data.error || 'Something went wrong.');
        setIsError(true);
      }
    } catch (error) {
      setStatus('Failed to submit feedback. Please try again later.');
      setIsError(true);
    }
  };

  const handleEdit = (id, description) => {
    setFeedback(description);
    setEditingId(id);
    setStatus('');
    setIsError(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await fetch(`http://localhost:8000/api/feedback/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchFeedbacks();
    } catch (err) {
      console.error('Failed to delete feedback');
    }
  };

  const handleHelpful = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/feedback/${id}/helpful`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        fetchFeedbacks();
      } else {
        console.error(data.error || 'Could not mark as helpful');
      }
    } catch (error) {
      console.error('Failed to mark feedback as helpful');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-sans">
      <div
        className="py-16 px-4 sm:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7)), url(${feedbackBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 mb-3">Share Your Thoughts</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your feedback helps us improve and create a better experience for everyone
            </p>
          </div>

          {/* Feedback Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-green-100">
            <h2 className="text-xl font-semibold text-green-800 mb-6 flex items-center">
              <FiUser className="mr-2" />
              {editingId ? 'Edit Your Feedback' : 'Write Your Feedback'}
            </h2>
            <form onSubmit={handleSubmit}>
              <textarea
                placeholder="What's on your mind? Share your suggestions, compliments, or concerns..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all"
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {editingId ? (
                    <>
                      <FiEdit2 className="mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
              {status && (
                <div
                  className={`mt-4 p-3 rounded-lg text-center ${
                    isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {status}
                </div>
              )}
            </form>
          </div>

          {/* Feedback Display */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-green-800">Community Feedback</h2>
              <div className="text-sm text-gray-500">
                {feedbacks.length} {feedbacks.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>

            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No feedback yet</div>
                <p className="text-gray-500 max-w-md mx-auto">
                  Be the first to share your thoughts and help us improve!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedbacks.map((fb) => {
                  const fullName = fb.customer
                    ? `${fb.customer.f_name} ${fb.customer.l_name}`
                    : 'Anonymous';
                  const profilePic = fb.customer?.profile_pic
                    ? `/${fb.customer.profile_pic}`
                    : '/uploads/user.png';
                  const alreadyMarkedHelpful = fb.helpful?.includes(currentUserId);

                  return (
                    <div
                      key={fb._id}
                      className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-all bg-gray-50/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={profilePic}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-gray-800">{fullName}</h3>
                              <p className="text-xs text-gray-400">
                                {fb.createdAt
                                  ? new Date(fb.createdAt).toLocaleString()
                                  : 'Unknown date'}
                              </p>
                            </div>
                            {currentUserId && fb.customer?._id === currentUserId && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEdit(fb._id, fb.feedback_description)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Edit"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(fb._id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 mt-2 pl-1">{fb.feedback_description}</p>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => handleHelpful(fb._id)}
                              disabled={fb.customer?._id === currentUserId}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                alreadyMarkedHelpful
                                  ? 'bg-green-100 text-green-800'
                                  : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                              } transition-all`}
                            >
                              <FiThumbsUp
                                className={
                                  alreadyMarkedHelpful ? 'text-green-600' : 'text-gray-500'
                                }
                              />
                              Helpful
                            </button>
                            <span className="text-xs text-gray-500">
                              {fb.helpful?.length || 0} people found this helpful
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;