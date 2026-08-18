import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FiSearch, FiMapPin, FiStar, FiFilter, FiX, 
  FiGrid, FiList, FiArrowLeft, FiArrowRight,
  FiSliders, FiChevronDown, FiBriefcase, FiUser
} from 'react-icons/fi';
import { FaUtensils, FaCoffee, FaGlassCheers, FaHotel, FaStore, FaSpa, FaDumbbell } from 'react-icons/fa';

import LoadingSpinner from '../components/common/LoadingSpinner';
import AdBanner from '../components/ads/AdBanner';
import DemoAdBanner from '../components/ads/DemoAdBanner';
import api from '../services/api';

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [allBusinesses, setAllBusinesses] = useState([]); // ALL businesses from API
  const [filteredBusinesses, setFilteredBusinesses] = useState([]); // Filtered results
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [useDemoAds, setUseDemoAds] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRating: '',
    priceRange: '',
    premiumOnly: false,
    featuredOnly: false,
    sortBy: 'rating'
  });

  // 🎯 Parse URL params and set filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    const featuredParam = params.get('featured');

    console.log('🔍 URL Params:', { searchParam, categoryParam, featuredParam });

    setFilters(prev => ({
      ...prev,
      search: searchParam || '',
      category: categoryParam || '',
      featuredOnly: featuredParam === 'true'
    }));
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // 🎯 Fetch ALL businesses (no filters)
  useEffect(() => {
    const fetchAllBusinesses = async () => {
      try {
        setLoading(true);
        
        // Fetch ALL businesses without category filter
        const response = await api.get('/businesses?limit=100');
        console.log('📊 All businesses fetched:', response.data.data.businesses?.length || 0);
        
        setAllBusinesses(response.data.data.businesses || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setAllBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBusinesses();
  }, []);

  // 🎯 CLIENT-SIDE FILTERING - This is the key fix!
  useEffect(() => {
    if (allBusinesses.length === 0) {
      setFilteredBusinesses([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    console.log('🔍 Applying filters:', filters);
    console.log('📊 Total businesses:', allBusinesses.length);

    let results = [...allBusinesses];

    // Filter by category (using category slug from URL)
    if (filters.category) {
      const categorySlug = filters.category.toLowerCase().trim();
      results = results.filter(business => {
        const businessCategory = business.category?.slug || business.category?.name || '';
        return businessCategory.toLowerCase().includes(categorySlug);
      });
      console.log(`📌 Filtered by category "${categorySlug}": ${results.length} businesses`);
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      results = results.filter(business => {
        const name = business.name?.toLowerCase() || '';
        const description = business.description?.toLowerCase() || '';
        return name.includes(searchTerm) || description.includes(searchTerm);
      });
      console.log(`🔎 Filtered by search "${filters.search}": ${results.length} businesses`);
    }

    // Filter by rating
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      results = results.filter(business => (business.rating || 0) >= minRating);
      console.log(`⭐ Filtered by rating >= ${minRating}: ${results.length} businesses`);
    }

    // Filter by price range
    if (filters.priceRange) {
      results = results.filter(business => business.price_range === filters.priceRange);
      console.log(`💰 Filtered by price "${filters.priceRange}": ${results.length} businesses`);
    }

    // Filter by premium
    if (filters.premiumOnly) {
      results = results.filter(business => business.is_premium === true);
      console.log(`👑 Filtered by premium: ${results.length} businesses`);
    }

    // Filter by featured
    if (filters.featuredOnly) {
      results = results.filter(business => business.is_featured === true);
      console.log(`⭐ Filtered by featured: ${results.length} businesses`);
    }

    // Sort results
    switch (filters.sortBy) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        results.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        break;
    }

    // Set filtered results
    setFilteredBusinesses(results);
    setTotalCount(results.length);
    setTotalPages(Math.ceil(results.length / 12));
    console.log(`📊 Final filtered results: ${results.length} businesses`);
  }, [allBusinesses, filters]);

  const handleFilterChange = (key, value) => {
    console.log(`🔄 Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Update URL
    if (key === 'search') {
      const params = new URLSearchParams(location.search);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      navigate(`/businesses?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({
      search: '',
      category: '',
      minRating: '',
      priceRange: '',
      premiumOnly: false,
      featuredOnly: false,
      sortBy: 'rating'
    });
    setCurrentPage(1);
    navigate('/businesses');
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * 12;
    const end = start + 12;
    return filteredBusinesses.slice(start, end);
  };

  const currentItems = getCurrentPageItems();

  // BusinessCard Component
  const BusinessCard = ({ business }) => {
    if (!business) return null;
    
    const coverImage = business.images?.find(img => img.is_cover)?.image_url || 
                       business.images?.[0]?.image_url || 
                       business.cover_image || 
                       business.logo;

    return (
      <Link to={`/business/${business.slug}`} className="group block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {coverImage ? (
              <img 
                src={coverImage}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const container = e.target.parentElement;
                  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
                  const colorIndex = (business.id || 0) % colors.length;
                  container.style.backgroundColor = colors[colorIndex];
                  container.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-2xl font-bold text-white opacity-80">${business.name}</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'][(business.id || 0) % 8]
                }}
              >
                <span className="text-2xl font-bold text-white opacity-80">{business.name}</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {business.is_featured && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
                  Featured
                </span>
              )}
              {business.is_premium && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg">
                  Premium
                </span>
              )}
            </div>
            
            {business.rating > 0 && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <FiStar className="text-yellow-400 fill-current text-sm" />
                <span className="text-white font-semibold text-sm">{parseFloat(business.rating).toFixed(1)}</span>
                <span className="text-gray-300 text-xs">({business.review_count || 0})</span>
              </div>
            )}
          </div>
          
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {business.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {business.category?.name || 'Business'}
                </p>
              </div>
              {business.price_range && (
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {business.price_range}
                </span>
              )}
            </div>
            
            <div className="mt-auto pt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 truncate">
                <FiMapPin className="text-xs flex-shrink-0" />
                <span className="truncate">{business.neighborhood || business.city || 'Tbilisi'}</span>
              </span>
              {business.review_count > 0 && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <FiStar className="text-yellow-400 fill-current text-xs" />
                  {parseFloat(business.rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // BusinessListItem Component
  const BusinessListItem = ({ business }) => {
    if (!business) return null;
    
    const coverImage = business.images?.find(img => img.is_cover)?.image_url || 
                       business.images?.[0]?.image_url || 
                       business.cover_image || 
                       business.logo;

    return (
      <Link to={`/business/${business.slug}`} className="group block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-200 dark:bg-gray-700">
            {coverImage ? (
              <img 
                src={coverImage}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const container = e.target.parentElement;
                  container.style.backgroundColor = '#4ECDC4';
                  container.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-2xl font-bold text-white opacity-80">${business.name}</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-2xl font-bold text-white opacity-80">{business.name}</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {business.is_featured && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
                  Featured
                </span>
              )}
              {business.is_premium && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg">
                  Premium
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {business.category?.name || 'Business'}
                  </p>
                </div>
                {business.price_range && (
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    {business.price_range}
                  </span>
                )}
              </div>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {business.description || 'Discover this amazing business in Tbilisi.'}
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FiMapPin className="text-xs" />
                  {business.neighborhood || business.city || 'Tbilisi'}
                </span>
                {business.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-current" />
                    {parseFloat(business.rating).toFixed(1)} ({business.review_count || 0})
                  </span>
                )}
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading && allBusinesses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Business Directory | Discover Tbilisi</title>
        <meta name="description" content="Find the best restaurants, cafes, hotels, and businesses in Tbilisi, Georgia." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Business Directory
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Discover the best businesses in Tbilisi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} businesses
              </span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* AD BANNER - DIRECTORY TOP */}
        <div className="mb-8">
          <DemoAdBanner 
            placement="directory_top"
            onAdClick={() => {
              console.log('📊 Ad Clicked: Directory Top');
              navigate('/deals');
            }}
          />
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search businesses..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter - FIXED: Uses slug matching */}
            <div className="md:w-48 relative">
              <select
                value={filters.category}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('📌 Category selected:', value);
                  handleFilterChange('category', value);
                }}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="md:w-48 relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-gray-900 dark:text-white"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FiSliders />
              <span>Filters</span>
              {(filters.minRating || filters.priceRange || filters.premiumOnly || filters.featuredOnly) && (
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </button>

            {(filters.search || filters.category || filters.minRating || filters.priceRange || filters.premiumOnly || filters.featuredOnly) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('minRating', filters.minRating === String(rating) ? '' : String(rating))}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        filters.minRating === String(rating)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  <option value="">All Prices</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.premiumOnly}
                    onChange={(e) => handleFilterChange('premiumOnly', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium Only</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featuredOnly}
                    onChange={(e) => handleFilterChange('featuredOnly', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured Only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {currentItems.length} of {totalCount} businesses
          </p>
        </div>

        {/* Business Grid */}
        {currentItems.length > 0 ? (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          } gap-6`}>
            {currentItems.map((business) => (
              viewMode === 'grid' ? (
                <BusinessCard key={business.id} business={business} />
              ) : (
                <BusinessListItem key={business.id} business={business} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No businesses found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* AD BANNER - DIRECTORY BOTTOM */}
        <div className="mt-8">
          <DemoAdBanner 
            placement="directory_bottom"
            onAdClick={() => {
              console.log('📊 Ad Clicked: Directory Bottom');
              navigate('/business/register');
            }}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft />
            </button>
            
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowRight />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BusinessDirectory;