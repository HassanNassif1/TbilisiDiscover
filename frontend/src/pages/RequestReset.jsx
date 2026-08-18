import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RequestReset = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/request-password-reset', { email });
      setSent(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Discover Tbilisi</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your email to receive reset instructions
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Password reset instructions have been sent to your email.
              </p>
              <Link to="/login" className="btn-primary">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Instructions'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestReset;