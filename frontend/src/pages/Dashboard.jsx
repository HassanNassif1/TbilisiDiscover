import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiUser, FiBriefcase, FiClock, FiStar, 
  FiTag, FiCalendar, FiBarChart2, FiSettings, FiAlertCircle
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, isBusiness, isAdmin } = useAuth();
  const location = useLocation();

  // Redirect regular users away from dashboard
  if (!isBusiness && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/dashboard', label: 'Overview', icon: FiHome },
    { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
    { path: '/dashboard/business', label: 'My Business', icon: FiBriefcase },
    { path: '/dashboard/hours', label: 'Hours', icon: FiClock },
    { path: '/dashboard/reviews', label: 'Reviews', icon: FiStar },
    { path: '/dashboard/deals', label: 'Deals', icon: FiTag },
    { path: '/dashboard/events', label: 'Events', icon: FiCalendar },
    { path: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  // Admin gets extra menu items
  if (isAdmin) {
    menuItems.push({ 
      path: '/admin', 
      label: 'Admin Panel', 
      icon: FiAlertCircle,
      external: true 
    });
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Discover Tbilisi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-2">{user?.full_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                  {user?.role}
                </span>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  if (item.external) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      >
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                        <span className="ml-auto text-xs bg-primary-200 dark:bg-primary-800 px-2 py-0.5 rounded">Admin</span>
                      </Link>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="business" element={<DashboardBusiness />} />
              <Route path="hours" element={<DashboardHours />} />
              <Route path="reviews" element={<DashboardReviews />} />
              <Route path="deals" element={<DashboardDeals />} />
              <Route path="events" element={<DashboardEvents />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

// Dashboard Overview
const DashboardOverview = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome back, {user?.full_name?.split(' ')[0]}! 👋
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Here's an overview of your business dashboard.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Profile Views</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Deals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
      </div>

      {user?.role === 'business' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Complete your business profile to attract more customers.
            Add photos, business hours, and services to make your listing stand out!
          </p>
        </div>
      )}
    </div>
  );
};

// Placeholder components
const DashboardProfile = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile</h2>
    <p className="text-gray-500 dark:text-gray-400">Manage your profile settings here.</p>
  </div>
);

const DashboardBusiness = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Business</h2>
    <p className="text-gray-500 dark:text-gray-400">Manage your business information.</p>
  </div>
);

const DashboardHours = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Business Hours</h2>
    <p className="text-gray-500 dark:text-gray-400">Set your business operating hours.</p>
  </div>
);

const DashboardReviews = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reviews</h2>
    <p className="text-gray-500 dark:text-gray-400">View and respond to customer reviews.</p>
  </div>
);

const DashboardDeals = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Deals</h2>
    <p className="text-gray-500 dark:text-gray-400">Create and manage your deals and promotions.</p>
  </div>
);

const DashboardEvents = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Events</h2>
    <p className="text-gray-500 dark:text-gray-400">Create and manage your events.</p>
  </div>
);

const DashboardAnalytics = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics</h2>
    <p className="text-gray-500 dark:text-gray-400">View your business performance metrics.</p>
  </div>
);

const DashboardSettings = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
    <p className="text-gray-500 dark:text-gray-400">Configure your account and notification settings.</p>
  </div>
);

export default Dashboard;