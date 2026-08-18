import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiX, FiTag, FiImage, FiMapPin, FiPhone, FiGlobe, FiMail, FiDollarSign, FiStar } from 'react-icons/fi';

const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('businesses');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    neighborhood: '',
    phone: '',
    website: '',
    email: '',
    price_range: '$$',
    category_id: '',
    cover_image: '',
    logo: '',
    rating: 0,
    is_featured: false,
    is_premium: false,
    status: 'active'
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: '',
    parent_id: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch businesses
      const businessesRes = await api.get('/admin/businesses');
      console.log('Businesses response:', businessesRes.data);
      setBusinesses(businessesRes.data?.data?.businesses || []);
      
      // Fetch categories
      const categoriesRes = await api.get('/categories');
      console.log('Categories response:', categoriesRes.data);
      setCategories(categoriesRes.data?.data?.categories || []);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Business CRUD
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const resetBusinessForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      neighborhood: '',
      phone: '',
      website: '',
      email: '',
      price_range: '$$',
      category_id: '',
      cover_image: '',
      logo: '',
      rating: 0,
      is_featured: false,
      is_premium: false,
      status: 'active'
    });
    setEditingBusiness(null);
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingBusiness) {
        await api.put(`/admin/businesses/${editingBusiness.id}`, formData);
        toast.success('Business updated successfully');
      } else {
        await api.post('/admin/businesses', formData);
        toast.success('Business added successfully');
      }
      setShowForm(false);
      resetBusinessForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save business');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name || '',
      description: business.description || '',
      address: business.address || '',
      neighborhood: business.neighborhood || '',
      phone: business.phone || '',
      website: business.website || '',
      email: business.email || '',
      price_range: business.price_range || '$$',
      category_id: business.category_id || '',
      cover_image: business.cover_image || '',
      logo: business.logo || '',
      rating: business.rating || 0,
      is_featured: business.is_featured || false,
      is_premium: business.is_premium || false,
      status: business.status || 'active'
    });
    setShowForm(true);
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;
    try {
      await api.delete(`/admin/businesses/${id}`);
      toast.success('Business deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete business');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/businesses/${id}/status`, { status });
      toast.success(`Business ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Category CRUD
  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      icon: '',
      parent_id: '',
      display_order: 0,
      is_active: true
    });
    setEditingCategory(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, categoryFormData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/categories', categoryFormData);
        toast.success('Category added successfully');
      }
      setShowCategoryForm(false);
      resetCategoryForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      icon: category.icon || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Render stars for display
// Render stars for display - FIXED
const renderStars = (rating) => {
  // Convert to number and handle null/undefined
  const numRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numRating);
  const emptyStars = 5 - fullStars;
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FiStar key={`full-${i}`} className="text-yellow-400 fill-current" />
      ))}
      {[...Array(emptyStars > 0 ? emptyStars : 0)].map((_, i) => (
        <FiStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {numRating > 0 ? numRating.toFixed(1) : 'No rating'}
      </span>
    </div>
  );
};

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('businesses')}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'businesses'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <span className="mr-2">🏢</span>
          Businesses ({businesses.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiTag className="mr-2" />
          Categories ({categories.length})
        </button>
      </div>

      {/* ========== BUSINESSES TAB ========== */}
      {activeTab === 'businesses' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Businesses</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all businesses on the platform
              </p>
            </div>
            <button
              onClick={() => {
                resetBusinessForm();
                setShowForm(true);
              }}
              className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiPlus className="mr-2 text-xl" />
              Add Business
            </button>
          </div>

          {/* Business List Table with Rating and Cover Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {businesses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center">
                        <div className="text-6xl mb-4">🏢</div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No businesses added yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Click the <strong className="text-primary-600">"Add Business"</strong> button to get started
                        </p>
                      </td>
                    </tr>
                  ) : (
                    businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {/* Cover Image */}
                            {business.cover_image ? (
                              <img 
                                src={business.cover_image} 
                                alt={business.name} 
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <FiImage />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{business.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {business.neighborhood || business.city || 'Tbilisi'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {business.category?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {business.rating > 0 ? (
                            renderStars(business.rating)
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">No rating</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={business.status}
                            onChange={(e) => handleStatusChange(business.id, e.target.value)}
                            className={`text-sm rounded-lg px-3 py-1 border focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              business.status === 'active' ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' :
                              business.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300' :
                              'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditBusiness(business)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteBusiness(business.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Business Form Modal - With Rating Field */}
          {showForm && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                  resetBusinessForm();
                }
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingBusiness ? 'Edit Business' : 'Add New Business'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetBusinessForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <form onSubmit={handleBusinessSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business Name */}
                    <div className="md:col-span-2">
                      <label className="input-label">Business Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="e.g., Cafe Littera"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="input-label">Category *</label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        className="input"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="text-xs text-yellow-600 mt-1">No categories found. Please add categories first.</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="input-label">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="input-label">Address *</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="input pl-10"
                          placeholder="e.g., 14 Kotetashvili St, Tbilisi"
                        />
                      </div>
                    </div>

                    {/* Neighborhood */}
                    <div>
                      <label className="input-label">Neighborhood</label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="e.g., Vake, Old Tbilisi"
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="input-label">Price Range</label>
                      <select
                        name="price_range"
                        value={formData.price_range}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="$">$ (Budget)</option>
                        <option value="$$">$$ (Moderate)</option>
                        <option value="$$$">$$$ (Expensive)</option>
                        <option value="$$$$">$$$$ (Luxury)</option>
                      </select>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="input-label">Phone</label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input pl-10"
                          placeholder="+995 555 123 456"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="input-label">Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          className="input pl-10"
                          placeholder="business@example.com"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="md:col-span-2">
                      <label className="input-label">Website</label>
                      <div className="relative">
                        <FiGlobe className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="input pl-10"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="input-label">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="input"
                        placeholder="Describe the business..."
                      />
                    </div>

                    {/* Cover Image */}
                    <div className="md:col-span-2">
                      <label className="input-label">Cover Image URL</label>
                      <div className="relative">
                        <FiImage className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="url"
                          name="cover_image"
                          value={formData.cover_image}
                          onChange={handleInputChange}
                          className="input pl-10"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                      {formData.cover_image && (
                        <div className="mt-2">
                          <img 
                            src={formData.cover_image} 
                            alt="Cover preview" 
                            className="w-full max-h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Free images from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">unsplash.com</a>
                      </p>
                    </div>

                    {/* Logo */}
                    <div className="md:col-span-2">
                      <label className="input-label">Logo URL</label>
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    {/* Rating Field - Clickable Stars */}
                    <div className="md:col-span-2">
                      <label className="input-label">Rating</label>
                      <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <FiStar 
                              className={`text-3xl ${
                                star <= formData.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {formData.rating > 0 ? `${formData.rating}.0 / 5.0` : 'Click stars to rate'}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                      <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">⭐ Featured</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_premium"
                            checked={formData.is_premium}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">💎 Premium</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="flex-1 btn-primary py-3" disabled={loading}>
                      {loading ? 'Saving...' : (editingBusiness ? 'Update Business' : 'Add Business')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetBusinessForm();
                      }}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== CATEGORIES TAB ========== */}
      {activeTab === 'categories' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all categories on the platform
              </p>
            </div>
            <button
              onClick={() => {
                resetCategoryForm();
                setShowCategoryForm(true);
              }}
              className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
            >
              <FiPlus className="mr-2 text-xl" />
              Add Category
            </button>
          </div>

          {/* Category List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center">
                        <div className="text-6xl mb-4">🏷️</div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No categories added yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Click the <strong className="text-primary-600">"Add Category"</strong> button to get started
                        </p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                              <FiTag />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            category.is_active
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowCategoryForm(false);
                  resetCategoryForm();
                }
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false);
                      resetCategoryForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Category Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      required
                      className="input"
                      placeholder="e.g., Restaurants"
                    />
                  </div>

                  <div>
                    <label className="input-label">Icon (optional)</label>
                    <input
                      type="text"
                      name="icon"
                      value={categoryFormData.icon}
                      onChange={handleCategoryInputChange}
                      className="input"
                      placeholder="e.g., FaUtensils"
                    />
                  </div>

                  <div>
                    <label className="input-label">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={categoryFormData.display_order}
                      onChange={handleCategoryInputChange}
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="input-label">Status</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          value="true"
                          checked={categoryFormData.is_active === true}
                          onChange={(e) => {
                            setCategoryFormData(prev => ({
                              ...prev,
                              is_active: e.target.value === 'true'
                            }));
                          }}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          value="false"
                          checked={categoryFormData.is_active === false}
                          onChange={(e) => {
                            setCategoryFormData(prev => ({
                              ...prev,
                              is_active: e.target.value === 'true'
                            }));
                          }}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="flex-1 btn-primary py-3" disabled={loading}>
                      {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        resetCategoryForm();
                      }}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBusinesses;