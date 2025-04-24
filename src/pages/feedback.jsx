import React, { useState } from 'react';
import feedbackBg from '../assets/images/feedbackbg.jpeg';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

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
      const res = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback_description: feedback }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback('');
        setStatus('Thank you for your feedback!');
        setIsError(false);
      } else {
        setStatus(data.error || 'Something went wrong.');
        setIsError(true);
      }
    } catch (error) {
      setStatus('Failed to submit feedback. Please try again later.');
      setIsError(true);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <section
        className="relative bg-cover bg-center py-16"
        style={{
          backgroundImage: `url(${feedbackBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto bg-white bg-opacity-90 shadow-xl p-8 rounded-md">
          <div className="text-black text-center p-6 rounded-t-md" style={{ backgroundColor: '#E2F2D7' }}>
            <h1 className="text-2xl font-bold">Send us your Feedback!</h1>
            <p className="mt-2 text-sm">
              We would love to hear your thoughts, suggestions, concerns or problems with anything so we can improve!
            </p>
          </div>
          <form className="p-6" onSubmit={handleSubmit}>
            <textarea
              placeholder="Add a comment"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-64 p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            ></textarea>
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-green-800 text-white font-semibold px-6 py-2 rounded-full hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
            {status && (
              <p className={`text-center mt-4 text-sm font-medium ${isError ? 'text-red-600' : 'text-green-800'}`}>
                {status}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;
