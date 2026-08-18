// components/realestate/AgentPropertyForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiPlus, FiLink, FiImage } from 'react-icons/fi';
import api from '../../services/api';

const AgentPropertyForm = ({ onClose, onSubmit, locations = [] }) => {
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAgentName(user.full_name || 'Agent');
  }, []);

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

// components/realestate/AgentPropertyForm.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (imageUrls.length === 0) {
    toast.warning('Please add at least one image URL');
    return;
  }

  // ✅ Add a random suffix to title if needed to avoid slug conflicts
  const title = formData.title.trim();
  const uniqueTitle = title; // Keep original title, slug will be made unique

  const data = {
    ...formData,
    title: uniqueTitle,
    images: imageUrls
  };
  
  console.log('📤 Submitting property:', data);
  
  setIsSubmitting(true);
  
  try {
    const response = await api.post('/real-estate/properties', data);
    console.log('✅ Property created:', response.data);
    
    toast.success('✅ Property posted successfully!');
    onSubmit && onSubmit(response.data.data);
    onClose();
  } catch (error) {
    console.error('❌ Error creating property:', error);
    
    // ✅ Handle duplicate slug error specifically
    if (error.response?.data?.message?.includes('slug must be unique')) {
      toast.error('A property with this title already exists. Please use a different title.');
    } else {
      toast.error(error.response?.data?.message || '❌ Failed to create property');
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏠 Post New Property
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agent: <span className="font-medium text-primary-600">{agentName}</span>
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URLs *
              </label>
              
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste your image URL here..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiPlus className="text-sm" />
                  Add
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} added
              </div>

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
                            e.target.src = 'https://via.placeholder.com/96x96/4A90D9/FFFFFF?text=Image';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="text-xs" />
                      </button>
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
                </div>
              )}
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
                Post Property as {agentName}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentPropertyForm;