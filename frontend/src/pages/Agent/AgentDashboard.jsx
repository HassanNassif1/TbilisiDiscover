// pages/Agent/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FiHome, FiPlus, FiList, FiUser, FiSettings, 
  FiLogOut, FiPhone, FiMail, FiBriefcase, FiShield,
  FiEye, FiEdit2, FiTrash2, FiClock, FiStar,
  FiMapPin, FiDollarSign, FiCalendar, FiCheckCircle,
  FiXCircle, FiAward, FiTrendingUp, FiUsers, FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AgentPropertyForm from '../RealEstate/agentpropertyform';
import AgentPropertyEditForm from '../../components/realestate/AgentPropertyEditForm';

const AgentDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [error, setError] = useState(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    views: 0,
    pending: 0,
    sold: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'agent' && user.role !== 'admin' && user.role !== 'super_admin') {
      toast.error('Access denied. Agent dashboard only.');
      navigate('/');
      return;
    }

    if (user) {
      fetchAgentData();
      loadLocations();
    }
  }, [user, isAuthenticated, navigate]);

  const loadLocations = async () => {
    try {
      const response = await api.get('/real-estate/locations');
      setLocations(response.data.data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching agent data for user:', user?.id);
      
      const profileRes = await api.get('/real-estate/agent/profile');
      console.log('📊 Profile response:', profileRes.data);
      setAgentProfile(profileRes.data.data);
      
      const propertiesRes = await api.get('/real-estate/agent/properties');
      console.log('📊 Properties response:', propertiesRes.data);
      const propertiesData = propertiesRes.data.data || [];
      setProperties(propertiesData);
      
      const total = propertiesData.length;
      const featured = propertiesData.filter(p => p.is_featured).length;
      const views = propertiesData.reduce((sum, p) => sum + (p.views || 0), 0);
      const pending = propertiesData.filter(p => p.status === 'pending').length;
      const sold = propertiesData.filter(p => p.status === 'sold' || p.status === 'rented').length;
      
      setStats({ total, featured, views, pending, sold });
      
    } catch (error) {
      console.error('❌ Error fetching agent data:', error);
      
      if (error.response?.status === 404) {
        setError('Agent profile not found. Please contact admin.');
        toast.error('Agent profile not found');
      } else {
        setError(error.response?.data?.message || 'Failed to load data');
        toast.error('Failed to load agent data');
      }
      
      setProperties([]);
      setStats({ total: 0, featured: 0, views: 0, pending: 0, sold: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await api.delete(`/real-estate/properties/${id}`);
      toast.success('Property deleted');
      fetchAgentData();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePropertyCreated = () => {
    setShowPropertyForm(false);
    fetchAgentData();
    toast.success('✅ Property added successfully!');
  };

  // ✅ Edit handlers
  const handleEditClick = (property) => {
    setEditingProperty(property);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingProperty(null);
    fetchAgentData();
    toast.success('✅ Property updated successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchAgentData}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agent Dashboard | Discover Tbilisi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              👤 Agent Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back, {user?.full_name || 'Agent'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAgentData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FiRefreshCw className="text-sm" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>

        {/* Agent Profile Card */}
        {agentProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.full_name || 'Agent'}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1">
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FiPhone className="text-sm" />
                    {agentProfile?.phone || user?.phone || 'No phone set'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FiMail className="text-sm" />
                    {user?.email}
                  </p>
                  {agentProfile?.company && (
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FiBriefcase className="text-sm" />
                      {agentProfile.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${
                  agentProfile?.is_verified 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {agentProfile?.is_verified ? (
                    <><FiCheckCircle /> Verified Agent</>
                  ) : (
                    <><FiXCircle /> Pending Verification</>
                  )}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  <FiClock className="inline mr-1" />
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">License Number</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {agentProfile.license_number || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Years Experience</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {agentProfile.years_experience || 0} years
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <FiStar className="text-yellow-400 fill-current" />
                  {agentProfile.rating || 0} ({agentProfile.total_reviews || 0} reviews)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Response Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {agentProfile.response_time || 'Within 24 hours'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Properties</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.featured}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.views}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.sold}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sold/Rented</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'properties'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiList className="inline mr-2" />
            My Properties ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiUser className="inline mr-2" />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiSettings className="inline mr-2" />
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'properties' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Properties
                </h2>
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <FiPlus />
                  Add New Property
                </button>
              </div>

              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden hover:shadow-xl transition-all group">
                      <Link to={`/real-estate/${property.id}`} className="block">
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                          <img
                            src={property.images?.[0]?.image_url || property.image || 'https://via.placeholder.com/400x300/4A90D9/FFFFFF?text=Property'}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300/4A90D9/FFFFFF?text=Property';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              property.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                            {property.is_featured && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-500 text-white rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              property.status === 'available' ? 'bg-green-500 text-white' :
                              property.status === 'pending' ? 'bg-orange-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {property.status || 'Available'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            {property.location}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span><FaBed className="inline mr-1" /> {property.bedrooms}</span>
                            <span><FaBath className="inline mr-1" /> {property.bathrooms}</span>
                            <span><FaRulerCombined className="inline mr-1" /> {property.sqft}sqft</span>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              ${property.price}
                              {property.type === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
                            </span>
                            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                              View Details →
                            </span>
                          </div>
                        </div>
                      </Link>
                      
                      {/* ✅ Action Buttons - Outside the link */}
                      <div className="px-4 pb-4 flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(property);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(property.id);
                          }}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-12 text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Properties Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start listing your properties to attract buyers and renters.
                  </p>
                  <button
                    onClick={() => setShowPropertyForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <FiPlus />
                    Add Your First Property
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <AgentProfile agentProfile={agentProfile} onUpdate={fetchAgentData} />
          )}

          {activeTab === 'settings' && (
            <AgentSettings agentProfile={agentProfile} onUpdate={fetchAgentData} />
          )}
        </div>
      </div>

      {/* ✅ Add Property Modal */}
      {showPropertyForm && (
        <AgentPropertyForm
          onClose={() => {
            setShowPropertyForm(false);
            console.log('🔒 Add modal closed');
          }}
          onSubmit={handlePropertyCreated}
          locations={locations}
        />
      )}

      {/* ✅ Edit Property Modal */}
      {showEditForm && editingProperty && (
        <AgentPropertyEditForm
          property={editingProperty}
          onClose={() => {
            setShowEditForm(false);
            setEditingProperty(null);
          }}
          onSubmit={handleEditSuccess}
          locations={locations}
        />
      )}
    </>
  );
};

// ============================================
// AGENT PROFILE COMPONENT
// ============================================

const AgentProfile = ({ agentProfile, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: agentProfile?.phone || user?.phone || '',
    company: agentProfile?.company || '',
    bio: agentProfile?.bio || '',
    license_number: agentProfile?.license_number || '',
    years_experience: agentProfile?.years_experience || '',
    contact_hours: agentProfile?.contact_hours || 'Mon-Fri 9:00 AM - 6:00 PM',
    response_time: agentProfile?.response_time || 'Within 24 hours'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/real-estate/agent/profile', formData);
      toast.success('✅ Profile updated successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="+995 555 123 456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Number
            </label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Years Experience
            </label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Hours
            </label>
            <input
              type="text"
              name="contact_hours"
              value={formData.contact_hours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Mon-Fri 9:00 AM - 6:00 PM"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Time
            </label>
            <input
              type="text"
              name="response_time"
              value={formData.response_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Within 24 hours"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio / About You
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Tell clients about yourself..."
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

// ============================================
// AGENT SETTINGS COMPONENT
// ============================================

// pages/Agent/AgentDashboard.jsx - AgentSettings Component

// pages/Agent/AgentDashboard.jsx - AgentSettings Component

const AgentSettings = ({ agentProfile, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Contact Preferences
    show_phone: agentProfile?.show_phone !== false,
    show_email: agentProfile?.show_email || false,
    contact_hours: agentProfile?.contact_hours || 'Mon-Fri 9:00 AM - 6:00 PM',
    response_time: agentProfile?.response_time || 'Within 24 hours',
    // Notification Settings
    notification_email: agentProfile?.notification_email !== false,
    notification_sms: agentProfile?.notification_sms || false,
    notification_property_matches: agentProfile?.notification_property_matches !== false,
    notification_messages: agentProfile?.notification_messages !== false,
    notification_marketing: agentProfile?.notification_marketing || false
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/real-estate/agent/settings', settings);
      console.log('✅ Settings saved:', response.data);
      toast.success('✅ Settings updated successfully!');
      onUpdate();
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Preferences Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📞 Contact Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show Phone Number</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Display your phone number on property listings</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('show_phone')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.show_phone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.show_phone ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Display your email on property listings</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('show_email')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.show_email
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.show_email ? 'ON' : 'OFF'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Hours
              </label>
              <input
                type="text"
                name="contact_hours"
                value={settings.contact_hours}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Mon-Fri 9:00 AM - 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Response Time
              </label>
              <input
                type="text"
                name="response_time"
                value={settings.response_time}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Within 24 hours"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔔 Notification Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notification_email')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.notification_email
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.notification_email ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notification_sms')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.notification_sms
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.notification_sms ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Property Match Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new properties match your clients' criteria</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notification_property_matches')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.notification_property_matches
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.notification_property_matches ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Message Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when a client sends you a message</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notification_messages')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.notification_messages
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.notification_messages ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Marketing & Promotions</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive marketing emails and promotional offers</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notification_marketing')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.notification_marketing
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {settings.notification_marketing ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default AgentDashboard;