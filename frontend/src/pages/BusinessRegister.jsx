import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BusinessRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    email: user?.email || '',
    phone: '',
    category_id: '',
    address: '',
    description: '',
    website: ''
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
      const response = await api.post('/businesses/register', formData);
      toast.success('Business registration submitted successfully! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register Your Business | Discover Tbilisi</title>
        <meta name="description" content="List your business on Discover Tbilisi and reach thousands of customers." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              List Your Business
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Reach thousands of customers in Tbilisi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Business Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="input-label">Owner Name *</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="business@email.com"
                />
              </div>

              <div>
                <label className="input-label">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="+995 555 123 456"
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="select"
                >
                  <option value="">Select a category</option>
                  <option value="1">Restaurants</option>
                  <option value="2">Cafés</option>
                  <option value="3">Bars</option>
                  <option value="4">Hotels</option>
                  <option value="5">Shops</option>
                  <option value="6">Spas</option>
                  <option value="7">Gyms</option>
                  <option value="8">Medical Centers</option>
                  <option value="9">Activities</option>
                  <option value="10">Tours</option>
                  <option value="11">Local Services</option>
                  <option value="12">Beauty Salons</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Street, building, neighborhood"
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="textarea"
                  placeholder="Describe your business, services, and what makes it special..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Your business will be reviewed by our team before being published.
                You will receive a notification once approved.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BusinessRegister;