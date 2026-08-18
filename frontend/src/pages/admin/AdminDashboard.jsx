// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FiHome, FiUsers, FiBriefcase, FiStar, FiTag, FiCalendar, 
  FiSettings, FiBarChart2, FiFileText, FiAlertCircle, FiLogOut,
  FiDollarSign, FiTrendingUp, FiUserCheck, FiPlus, FiEdit,
  FiTrash2, FiEye, FiCheck, FiX, FiClock, FiLayers, FiShield
} from 'react-icons/fi';

// Import components
import AdminBusinesses from './AdminBusinesses';
import AdManager from '../../components/ads/AdManager';
import AdminRealEstate from '../RealEstate/AdminRealEstate';
import AdminAgents from './AdminAgents';

// Admin Dashboard Main Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: FiHome },
    { path: '/admin/users', label: 'Users', icon: FiUsers },
    { path: '/admin/agents', label: '👤 Agents', icon: FiShield },
    { path: '/admin/businesses', label: 'Businesses', icon: FiBriefcase },
    { path: '/admin/reviews', label: 'Reviews', icon: FiStar },
    { path: '/admin/deals', label: 'Deals', icon: FiTag },
    { path: '/admin/events', label: 'Events', icon: FiCalendar },
    { path: '/admin/real-estate', label: '🏠 Real Estate', icon: FiHome },
    { path: '/admin/ads', label: 'Ad Manager', icon: FiDollarSign },
    { path: '/admin/reports', label: 'Reports', icon: FiAlertCircle },
    { path: '/admin/subscriptions', label: 'Subscriptions', icon: FiDollarSign },
    { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Discover Tbilisi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {user?.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-2">Admin Panel</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                  {user?.role}
                </span>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
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

              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-2 mt-4 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="agents" element={<AdminAgents />} />
              <Route path="businesses" element={<AdminBusinesses />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="deals" element={<AdminDeals />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="real-estate" element={<AdminRealEstate />} />
              <Route path="ads" element={<AdManager />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// OVERVIEW DASHBOARD
// ============================================

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.total_users || 0, icon: FiUsers, color: 'bg-blue-500' },
    { label: 'Active Users', value: stats?.stats?.active_users || 0, icon: FiUserCheck, color: 'bg-green-500' },
    { label: 'Total Businesses', value: stats?.stats?.total_businesses || 0, icon: FiBriefcase, color: 'bg-purple-500' },
    { label: 'Pending Businesses', value: stats?.stats?.pending_businesses || 0, icon: FiClock, color: 'bg-yellow-500' },
    { label: 'Premium Businesses', value: stats?.stats?.premium_businesses || 0, icon: FiTrendingUp, color: 'bg-indigo-500' },
    { label: 'Total Reviews', value: stats?.stats?.total_reviews || 0, icon: FiStar, color: 'bg-pink-500' },
    { label: 'Total Deals', value: stats?.stats?.total_deals || 0, icon: FiTag, color: 'bg-red-500' },
    { label: 'Total Events', value: stats?.stats?.total_events || 0, icon: FiCalendar, color: 'bg-teal-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon className="text-xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
          {stats?.recent?.users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Businesses</h3>
          {stats?.recent?.businesses?.map((business) => (
            <div key={business.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{business.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">by {business.owner?.full_name}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                business.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                business.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {business.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// USERS MANAGEMENT
// ============================================

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/admin/users?page=${page}&limit=20`);
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.pages);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total: {users.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="business">Business</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REVIEWS MANAGEMENT
// ============================================

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/admin/reviews');
        setReviews(response.data.data.reviews);
      } catch (error) {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleModerateReview = async (reviewId, status) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/moderate`, { status });
      toast.success('Review moderated');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status } : r));
    } catch (error) {
      toast.error('Failed to moderate review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total: {reviews.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Business</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Content</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{review.user?.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{review.business?.name}</td>
                  <td className="px-4 py-3 text-sm text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{review.content}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${(
                      review.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      review.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    )}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleModerateReview(review.id, 'approved')}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                        >
                          <FiCheck />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerateReview(review.id, 'rejected')}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <FiX />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DEALS MANAGEMENT
// ============================================

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await api.get('/admin/deals');
        setDeals(response.data.data.deals);
      } catch (error) {
        toast.error('Failed to load deals');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleApproveDeal = async (dealId, status) => {
    try {
      await api.put(`/admin/deals/${dealId}/approve`, { status });
      toast.success('Deal approved');
      setDeals(deals.map(d => d.id === dealId ? { ...d, status } : d));
    } catch (error) {
      toast.error('Failed to approve deal');
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await api.delete(`/admin/deals/${dealId}`);
      toast.success('Deal deleted');
      setDeals(deals.filter(d => d.id !== dealId));
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deals</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total: {deals.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Business</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{deal.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{deal.business?.name}</td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{deal.discount_percent}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      deal.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      deal.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {deal.status === 'pending' && (
                        <button
                          onClick={() => handleApproveDeal(deal.id, 'active')}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENTS MANAGEMENT
// ============================================

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/admin/events');
        setEvents(response.data.data.events);
      } catch (error) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleApproveEvent = async (eventId, status) => {
    try {
      await api.put(`/admin/events/${eventId}/approve`, { status });
      toast.success('Event approved');
      setEvents(events.map(e => e.id === eventId ? { ...e, status } : e));
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/admin/events/${eventId}`);
      toast.success('Event deleted');
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total: {events.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Business</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{event.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{event.business?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.event_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      event.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      event.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {event.status === 'pending' && (
                        <button
                          onClick={() => handleApproveEvent(event.id, 'approved')}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REPORTS MANAGEMENT
// ============================================

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        setReports(response.data.data.reports);
      } catch (error) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { status });
      toast.success('Report resolved');
      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total: {reports.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reporter</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{report.reporter?.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{report.target_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{report.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      report.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleResolveReport(report.id, 'resolved')}
                        className="text-green-600 hover:text-green-800 dark:text-green-400"
                      >
                        <FiCheck />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUBSCRIPTIONS MANAGEMENT
// ============================================

const AdminSubscriptions = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Subscriptions</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
        <p className="text-gray-500 dark:text-gray-400">Subscription management coming soon...</p>
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS
// ============================================

const AdminAnalytics = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
        <p className="text-gray-500 dark:text-gray-400">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

// ============================================
// SETTINGS
// ============================================

const AdminSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
        <p className="text-gray-500 dark:text-gray-400">Admin settings coming soon...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;