// pages/RealEstate/AdminRealEstate.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, 
  FiFilter, FiX, FiCheck, FiClock, FiMapPin,
  FiHome, FiDollarSign, FiUsers, FiFileText,
  FiTrendingUp, FiCalendar, FiImage, FiUpload,
  FiLink
} from 'react-icons/fi';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

// Property Form Component
const PropertyForm = ({ onClose, onSubmit, property = null, locations = [] }) => {
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || '',
    type: property?.type || 'rent',
    location: property?.location || '',
    address: property?.address || '',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    sqft: property?.sqft || 0,
    status: property?.status || 'available',
    is_featured: property?.is_featured || false,
    images: property?.images || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize imageUrls from property or empty array
  const [imageUrls, setImageUrls] = useState(() => {
    if (property?.images && property.images.length > 0) {
      return property.images.map(img => img.image_url || img);
    }
    return [];
  });

  const [imageInput, setImageInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageAdd = () => {
    const url = imageInput.trim();
    if (!url) {
      toast.warning('Please enter an image URL');
      return;
    }

    // Validate URL
    try {
      new URL(url);
      setImageUrls(prev => {
        const newUrls = [...prev, url];
        console.log('📸 Images after add:', newUrls);
        return newUrls;
      });
      setImageInput('');
      toast.success('✅ Image added successfully');
    } catch (e) {
      toast.error('❌ Please enter a valid image URL (e.g., https://example.com/image.jpg)');
    }
  };

  const handleImageRemove = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  // ✅ FIXED: Make sure images are included in the request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📸 Image URLs before submit:', imageUrls);
    
    if (imageUrls.length === 0) {
      toast.warning('Please add at least one image URL');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ Make sure images are properly formatted
      const data = {
        ...formData,
        images: imageUrls  // This should be an array of strings
      };
      
      console.log('📤 Submitting data:', JSON.stringify(data, null, 2));
      
      let response;
      if (property) {
        response = await api.put(`/real-estate/properties/${property.id}`, data);
        toast.success('✅ Property updated successfully!');
      } else {
        response = await api.post('/real-estate/properties', data);
        toast.success('✅ Property posted successfully!');
      }
      
      console.log('📥 Response:', response.data);
      
      onSubmit && onSubmit();
      onClose();
    } catch (error) {
      console.error('❌ Error saving property:', error);
      toast.error(error.response?.data?.message || '❌ Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key on image input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleImageAdd();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {property ? '✏️ Edit Property' : '🏠 Post New Property'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern Apartment in Vake"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the property..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="450"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
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
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Vazha-Pshavela Ave 61, Tbilisi"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Bedrooms */}
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
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Bathrooms */}
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
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Sqft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Square Feet
              </label>
              <input
                type="number"
                name="sqft"
                value={formData.sqft}
                onChange={handleChange}
                placeholder="85"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            {/* Featured */}
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⭐ Feature this property (highlight on homepage)
              </label>
            </div>

            {/* Images - Custom URL Input Only */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URLs *
              </label>
              
              {/* Image URL Input */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste your image URL here (e.g., https://example.com/photo.jpg)"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <FiPlus className="text-sm" />
                  Add Image
                </button>
              </div>

              {/* Show number of images added */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} added
              </div>

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                        <img
                          src={url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Cpath d="M21 15l-5-5-5 5-5-5-3 3"/%3E%3C/svg%3E';
                            e.target.className = 'w-full h-full object-cover p-4';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <FiX className="text-xs" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 truncate px-1">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imageUrls.length === 0 && (
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <FiImage className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No images added yet. Paste your image URL above.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Supported: JPG, PNG, WebP, GIF
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                💡 Tip: Upload images to a hosting service (like Imgur, Cloudinary, or your own server) and paste the URL here
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span> Saving...
              </>
            ) : (
              <>
                <FiPlus />
                {property ? 'Update Property' : 'Post Property'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Admin Real Estate Component
const AdminRealEstate = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, locationsRes] = await Promise.all([
        api.get('/real-estate/properties').catch(() => ({ data: { data: [] } })),
        api.get('/real-estate/locations').catch(() => ({ data: { data: [] } }))
      ]);

      // ✅ FALLBACK LOCATIONS
      const locationData = locationsRes.data.data?.length > 0 
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

      setProperties(propertiesRes.data.data || []);
      setLocations(locationData);
    } catch (error) {
      console.error('Error loading data:', error);
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
      toast.error('Failed to load locations, using default list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      const img = property.images[0];
      return img.image_url || img;
    }
    // Default placeholder if no image
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Cpath d="M21 15l-5-5-5 5-5-5-3 3"/%3E%3C/svg%3E';
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesType;
  });

  // Delete property
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await api.delete(`/real-estate/properties/${id}`);
      toast.success('✅ Property deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('❌ Failed to delete property');
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingProperty(null);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Real Estate Admin | Discover Tbilisi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🏠 Real Estate Manager
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage property listings ({properties.length} total)
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProperty(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FiPlus />
            Post New Property
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="rent">For Rent</option>
              <option value="buy">For Sale</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden hover:shadow-xl transition-all">
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <img
                  src={getImageUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Cpath d="M21 15l-5-5-5 5-5-5-3 3"/%3E%3C/svg%3E';
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
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                  <FiEye className="inline mr-1" /> {property.views || 0}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FiMapPin className="text-xs" />
                  {property.location}
                </p>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaBed className="text-xs" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBath className="text-xs" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaRulerCombined className="text-xs" /> {property.sqft} sqft
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    ${property.price}
                    {property.type === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/real-estate/${property.id}`)}
                      className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                      title="View"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProperty(property);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No properties found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your filters' : 'Start by posting your first property'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowForm(true);
                }}
                className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <FiPlus className="inline mr-2" />
                Post First Property
              </button>
            )}
          </div>
        )}

        {/* Property Form Modal */}
        {showForm && (
          <PropertyForm
            onClose={() => {
              setShowForm(false);
              setEditingProperty(null);
            }}
            onSubmit={handleFormSubmit}
            property={editingProperty}
            locations={locations}
          />
        )}
      </div>
    </>
  );
};

export default AdminRealEstate;