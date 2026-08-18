import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Verify Email | Discover Tbilisi</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {loading ? (
            <LoadingSpinner />
          ) : success ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your email has been successfully verified. You can now login to your account.
              </p>
              <Link to="/login" className="btn-primary">
                Login Now
              </Link>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Link to="/login" className="btn-primary">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;