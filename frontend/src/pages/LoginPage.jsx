// pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      setLoading(false);

      if (result.success) {
        const user = result.user;
        console.log('✅ Login successful, user:', user);
        
        // ✅ Redirect based on role
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin');
        } else if (user.role === 'agent') {
          navigate('/agent/dashboard');
        } else {
          toast.error('Access denied. Only admins and agents can access this platform.');
          navigate('/');
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Discover Tbilisi</title>
        <meta name="description" content="Login to your Discover Tbilisi account." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/request-reset" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/agent/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register as Agent
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;