import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiMapPin, FiHome, FiDollarSign, FiCalendar,
  FiHeart, FiShare2, FiEye, FiMessageCircle, FiFilter,
  FiChevronDown, FiPlus, FiX, FiCheck, FiClock, FiArrowRight
} from 'react-icons/fi';
import { FaBed, FaBath, FaRulerCombined, FaParking } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// 🏠 Property Request Component - COMPLETE WITH LOGIC
const PropertyRequestForm = ({ onClose, onSubmit, locations }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    type: 'rent',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    name: '',
    phone: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Pre-fill user data if logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted:', formData);
    
    // ✅ Validation
    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }
    if (!formData.minPrice || !formData.maxPrice) {
      toast.error('Please enter price range');
      return;
    }
    if (parseInt(formData.minPrice) > parseInt(formData.maxPrice)) {
      toast.error('Min price cannot be greater than max price');
      return;
    }
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your contact information');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ Send request to API
      const response = await api.post('/real-estate/requests', {
        type: formData.type,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        location: formData.location,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        description: formData.description || '',
        name: formData.name,
        phone: formData.phone,
        email: formData.email || ''
      });

      console.log('✅ Request submitted:', response.data);
      
      toast.success('✅ Request submitted successfully! We\'ll match you with properties.');
      onSubmit && onSubmit(response.data.data);
      onClose();
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      console.error('❌ Response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Please login to submit a request');
      } else {
        toast.error(error.response?.data?.message || '❌ Failed to submit request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏠 Find Your Dream Home
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tell us what you're looking for and we'll match you with properties
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Property Type */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                I want to
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'rent' })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.type === 'rent'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'buy' })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.type === 'buy'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  Buy
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Price ($) *
              </label>
              <input
                type="number"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                placeholder="300"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Price ($) *
              </label>
              <input
                type="number"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="500"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id || loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Requirements
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you're looking for... (e.g., 'I want a modern apartment with a balcony in Vake...')"
                rows="4"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Contact Info */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+995 555 123 456"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <FiCheck className="text-green-500" />
              We'll match your request with available properties and notify you
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span> Submitting...
              </>
            ) : (
              <>
                <FiPlus />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// 🏠 Property Card Component
const PropertyCard = ({ property }) => {
  const [isLiked, setIsLiked] = useState(false);

  let imageUrl = property.image;
  if (property.images && property.images.length > 0) {
    const firstImage = property.images[0];
    imageUrl = firstImage.image_url || firstImage;
  }
  
  if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
    imageUrl = property.type === 'rent' 
      ? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
      : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
  }

  const agentName = property.agent?.name || 'Agent';

  return (
    <Link to={`/real-estate/${property.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={property.title || 'Property'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = property.type === 'rent' 
                ? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
                : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
            }}
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              property.type === 'rent' 
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              {property.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {property.is_featured && (
              <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
                ⭐ Featured
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
          >
            <FiHeart className={`text-xl ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1 text-white text-sm">
            <FiEye className="text-sm" />
            {property.views || 0}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                {property.title || 'Untitled Property'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiMapPin className="text-xs" />
                {property.location || 'Tbilisi'}
              </p>
            </div>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
              ${property.price || 0}
              {property.type === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FaBed className="text-xs" /> {property.bedrooms || 0} beds
            </span>
            <span className="flex items-center gap-1">
              <FaBath className="text-xs" /> {property.bathrooms || 0} baths
            </span>
            <span className="flex items-center gap-1">
              <FaRulerCombined className="text-xs" /> {property.sqft || 0} sqft
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                {agentName?.[0] || 'A'}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {agentName}
              </span>
            </div>
            <span className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline flex items-center gap-1">
              View Details 
              <FiArrowRight className="text-sm" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// 📋 Recent Requests Component
const RecentRequests = ({ requests, onRefresh }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📋 Recent Property Requests
          </h3>
          <button
            onClick={onRefresh}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Refresh ↻
          </button>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No requests yet. Be the first to post!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📋 Recent Property Requests
        </h3>
        <button
          onClick={onRefresh}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Refresh ↻
        </button>
      </div>
      <div className="space-y-3">
        {requests.slice(0, 10).map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  request.type === 'rent' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                }`}>
                  {request.type === 'rent' ? '🔵 Rent' : '🟢 Buy'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {request.location}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    : request.status === 'matched'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {request.status || 'pending'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${request.min_price || '?'} - ${request.max_price || '?'} • 
                {request.bedrooms || '?'} beds • {request.bathrooms || '?'} baths
              </p>
              {request.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md">
                  {request.description}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {request.name || 'Anonymous'} • {request.phone || ''}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 dark:text-gray-500 block">
                <FiClock className="inline mr-1" />
                {new Date(request.created_at || request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Real Estate Page
const RealEstateHome = () => {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, requestsRes, locationsRes] = await Promise.all([
        api.get('/real-estate/properties?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/real-estate/requests').catch(() => ({ data: { data: [] } })),
        api.get('/real-estate/locations').catch(() => ({ data: { data: [] } }))
      ]);

      setProperties(propertiesRes.data.data || []);
      setRequests(requestsRes.data.data || []);
      
      const locationData = locationsRes.data.data && locationsRes.data.data.length > 0 
        ? locationsRes.data.data 
        : [
            { id: 1, name: 'Vake' },
            { id: 2, name: 'Saburtalo' },
            { id: 3, name: 'Old Tbilisi' },
            { id: 4, name: 'Mtatsminda' },
            { id: 5, name: 'Vera' },
            { id: 6, name: 'Chughureti' },
            { id: 7, name: 'Avlabari' },
            { id: 8, name: 'Didube' },
            { id: 9, name: 'Gldani' },
            { id: 10, name: 'Isani' },
            { id: 11, name: 'Samgori' },
            { id: 12, name: 'Krkheli' }
          ];
      setLocations(locationData);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setProperties([]);
      setRequests([]);
      setLocations([
        { id: 1, name: 'Vake' },
        { id: 2, name: 'Saburtalo' },
        { id: 3, name: 'Old Tbilisi' },
        { id: 4, name: 'Mtatsminda' },
        { id: 5, name: 'Vera' },
        { id: 6, name: 'Chughureti' },
        { id: 7, name: 'Avlabari' },
        { id: 8, name: 'Didube' },
        { id: 9, name: 'Gldani' },
        { id: 10, name: 'Isani' },
        { id: 11, name: 'Samgori' },
        { id: 12, name: 'Krkheli' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmitted = (newRequest) => {
    fetchData();
    toast.success('✅ Your request has been posted!');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Real Estate in Tbilisi | Discover Tbilisi</title>
        <meta name="description" content="Find your dream home in Tbilisi. Rent or buy apartments, houses, and properties in Vake, Saburtalo, Old Tbilisi, and more." />
      </Helmet>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Find Your Dream Home in <br />
              <span className="text-yellow-300">Tbilisi</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Rent, buy, or request a property - we'll help you find the perfect place
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏠 Properties in Tbilisi
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {properties.length} properties available
            </p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FiPlus />
            Post Your Request
          </button>
        </div>

        {showRequestForm && (
          <PropertyRequestForm 
            onClose={() => setShowRequestForm(false)}
            onSubmit={handleRequestSubmitted}
            locations={locations}
          />
        )}

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-8">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-lg text-gray-500 dark:text-gray-400">No properties available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back soon for new listings</p>
          </div>
        )}

        <RecentRequests 
          requests={requests} 
          onRefresh={fetchData}
        />

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mt-8">
          <h3 className="text-2xl font-bold mb-2">
            🏠 Can't find what you're looking for?
          </h3>
          <p className="text-blue-100 mb-4">
            Post your property request and get matched with the perfect home
          </p>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Post Your Request →
          </button>
        </div>
      </div>
    </>
  );
};

export default RealEstateHome;