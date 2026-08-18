// components/realestate/AgentPropertyEditForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiPlus, FiLink, FiImage, FiSave } from 'react-icons/fi';
import api from '../../services/api';

const AgentPropertyEditForm = ({ property, onClose, onSubmit, locations = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'rent',
    location: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    status: 'available',
    is_featured: false,
    images: []
  });

  const [imageUrls, setImageUrls] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentName, setAgentName] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        type: property.type || 'rent',
        location: property.location || '',
        address: property.address || '',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        sqft: property.sqft || 0,
        status: property.status || 'available',
        is_featured: property.is_featured || false,
        images: property.images || []
      });

      if (property.images && property.images.length > 0) {
        const urls = property.images.map(img => img.image_url || img);
        setImageUrls(urls);
      }
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAgentName(user.full_name || 'Agent');
  }, [property]);

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

    try {
      new URL(url);
      setImageUrls(prev => [...prev, url]);
      setImageInput('');
      toast.success('✅ Image added');
    } catch (e) {
      toast.error('❌ Please enter a valid image URL');
    }
  };

  const handleImageRemove = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleImageAdd();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      toast.warning('Please add at least one image URL');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = {
        ...formData,
        images: imageUrls
      };
      
      console.log('📤 Updating property:', data);
      console.log('🔑 Property ID:', property.id);
      
      const response = await api.put(`/real-estate/properties/${property.id}`, data);
      console.log('✅ Property updated:', response.data);
      
      toast.success('✅ Property updated successfully!');
      onSubmit && onSubmit(response.data.data);
      onClose();
    } catch (error) {
      console.error('❌ Error updating property:', error);
      console.error('❌ Response:', error.response);
      const message = error.response?.data?.message || '❌ Failed to update property';
      toast.error(message);
      
      // If 403, show more helpful message
      if (error.response?.status === 403) {
        toast.error('You do not have permission to edit this property. Please contact admin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✏️ Edit Property</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Agent: <span className="font-medium text-primary-600">{agentName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" required />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" required />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
            </div>

            {/* Location */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
              <select name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" required>
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
              <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                {[1, 2, 3, 4, 5, 6].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
              <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>

            {/* Sqft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Square Feet</label>
              <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            {/* Featured */}
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">⭐ Feature this property</label>
            </div>

            {/* Images */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URLs *</label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Paste your image URL here..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <button type="button" onClick={handleImageAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <FiPlus className="text-sm" /> Add
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} added</div>

              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                        <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/96x96/4A90D9/FFFFFF?text=Image'; }} />
                      </div>
                      <button type="button" onClick={() => handleImageRemove(index)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageUrls.length === 0 && (
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <FiImage className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No images added yet. Paste your image URL above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <><span className="animate-spin">⏳</span> Saving...</> : <><FiSave /> Update Property</>}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentPropertyEditForm;