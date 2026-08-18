import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiMapPin, FiArrowRight, FiStar, FiHeart, FiEye } from 'react-icons/fi';
import { 
  FaUtensils, FaCoffee, FaGlassCheers, FaHotel, FaStore, 
  FaSpa, FaDumbbell, FaEllipsisH 
} from 'react-icons/fa';

import LoadingSpinner from '../components/common/LoadingSpinner';
import AdBanner from '../components/ads/AdBanner';
import DemoAdBanner from '../components/ads/DemoAdBanner';
import api from '../services/api';

// 🎯 Smart Search Function
const detectSearchIntent = (query) => {
  const lowerQuery = query.toLowerCase().trim();
  
  const categoryMap = {
    restaurants: ['restaurant', 'restaurants', 'dining', 'eat', 'food', 'dinner', 'lunch', 'breakfast', 'brunch', 'meal', 'cuisine'],
    cafes: ['cafe', 'cafes', 'coffee', 'coffee shop', 'bakery', 'pastry', 'espresso', 'latte', 'cappuccino'],
    bars: ['bar', 'bars', 'pub', 'pubs', 'nightlife', 'cocktail', 'drink', 'beer', 'wine', 'club'],
    hotels: ['hotel', 'hotels', 'stay', 'accommodation', 'lodge', 'resort', 'guesthouse', 'hostel', 'inn'],
    shops: ['shop', 'shops', 'store', 'stores', 'shopping', 'boutique', 'retail', 'market'],
    spas: ['spa', 'spas', 'wellness', 'massage', 'relax', 'sauna', 'beauty', 'meditation'],
    gyms: ['gym', 'gyms', 'fitness', 'workout', 'exercise', 'training', 'yoga', 'pilates']
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return { type: 'category', value: category };
    }
  }

  const locationKeywords = ['tbilisi', 'georgia', 'vazha', 'chavchavadze', 'rustaveli'];
  if (locationKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return { type: 'location', value: lowerQuery };
  }

  return { type: 'search', value: lowerQuery };
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDemoAds, setUseDemoAds] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // ✅ Fetch businesses from API
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching businesses from API...');
      
      // ✅ Fetch ALL businesses from database
      const response = await api.get('/businesses?limit=100');
      
      console.log('📊 Full API Response:', response.data);
      
      // Handle different response structures
      let businesses = [];
      if (response.data?.data?.businesses) {
        businesses = response.data.data.businesses;
      } else if (response.data?.businesses) {
        businesses = response.data.businesses;
      } else if (Array.isArray(response.data)) {
        businesses = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        businesses = response.data.data;
      } else {
        console.warn('⚠️ Unexpected API response structure:', response.data);
        businesses = [];
      }
      
      console.log('📊 Businesses fetched:', businesses.length);
      
      // Store all businesses
      setAllBusinesses(businesses);
      
      // ✅ Filter featured businesses (is_featured = true)
      const featured = businesses.filter(b => b.is_featured === true);
      setFeaturedBusinesses(featured);
      console.log('⭐ Featured businesses:', featured.length);
      
      // ✅ Sort by views for popular (highest views first)
      const popular = [...businesses].sort((a, b) => (b.views || 0) - (a.views || 0));
      setPopularBusinesses(popular.slice(0, 6));
      console.log('🔥 Popular businesses:', popular.slice(0, 6).length);
      
    } catch (error) {
      console.error('❌ Error fetching businesses:', error);
      setError(error.message || 'Failed to load businesses');
      setAllBusinesses([]);
      setFeaturedBusinesses([]);
      setPopularBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Handle search with smart detection
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const intent = detectSearchIntent(searchQuery);
    console.log('🔍 Search Intent:', intent);

    const params = new URLSearchParams();
    
    if (intent.type === 'category') {
      params.set('category', intent.value);
    } else {
      params.set('search', searchQuery);
    }

    navigate(`/businesses?${params.toString()}`);
  };

  // 🎯 Live suggestions while typing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 1) {
      const suggestions = [];
      const lowerValue = value.toLowerCase();
      
      // Category suggestions
      const categories = [
        { name: 'Restaurants', slug: 'restaurants', icon: '🍽️' },
        { name: 'Cafés', slug: 'cafes', icon: '☕' },
        { name: 'Bars', slug: 'bars', icon: '🍺' },
        { name: 'Hotels', slug: 'hotels', icon: '🏨' },
        { name: 'Shops', slug: 'shops', icon: '🛍️' },
        { name: 'Spas', slug: 'spas', icon: '💆' },
        { name: 'Gyms', slug: 'gyms', icon: '💪' },
        { name: 'Properties', slug: 'properties', icon: '🏠' }
      ];
      
      categories.forEach(cat => {
        if (cat.name.toLowerCase().includes(lowerValue) || 
            cat.slug.includes(lowerValue)) {
          suggestions.push({
            text: `${cat.icon} ${cat.name}`,
            type: 'category',
            value: cat.slug,
            description: `Search ${cat.name}`
          });
        }
      });

      // Location suggestions from actual businesses
      const locations = ['Tbilisi', 'Vake', 'Saburtalo', 'Old Tbilisi', 'Mtatsminda', 'Isani'];
      locations.forEach(loc => {
        if (loc.toLowerCase().includes(lowerValue)) {
          suggestions.push({
            text: `📍 ${loc}`,
            type: 'location',
            value: loc,
            description: `Businesses in ${loc}`
          });
        }
      });

      suggestions.push({
        text: `🔍 Search "${value}"`,
        type: 'search',
        value: value,
        description: 'Search by name or description'
      });

      setSearchSuggestions(suggestions.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const categories = [
    { icon: FaUtensils, name: 'Restaurants', slug: 'restaurants', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: FaCoffee, name: 'Cafés', slug: 'cafes', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: FaGlassCheers, name: 'Bars', slug: 'bars', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: FaHotel, name: 'Hotels', slug: 'hotels', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: FaStore, name: 'Shops', slug: 'shops', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { icon: FaSpa, name: 'Spas', slug: 'spas', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { icon: FaDumbbell, name: 'Gyms', slug: 'gyms', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: FaEllipsisH, name: 'More', slug: 'more', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' }
  ];

  const handleSearchClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    if (suggestion.type === 'category') {
      navigate(`/businesses?category=${suggestion.value}`);
    } else if (suggestion.type === 'location') {
      navigate(`/businesses?search=${suggestion.value}`);
    } else {
      navigate(`/businesses?search=${suggestion.value}`);
    }
  };

  // ✅ Business Card Component
  const BusinessCard = ({ business }) => {
    if (!business) return null;
    
    // ✅ Get the image URL from database
    let imageUrl = business.image || business.cover_image || business.logo;
    if (business.images && business.images.length > 0) {
      const firstImage = business.images[0];
      imageUrl = firstImage.image_url || firstImage.url || firstImage;
    }
    
    // ✅ Only use fallback if NO image exists in database
    if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
      imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
    }

    // Get category icon
    const getCategoryIcon = (categoryName) => {
      const catMap = {
        'restaurant': '🍽️',
        'cafe': '☕',
        'bar': '🍺',
        'hotel': '🏨',
        'shop': '🛍️',
        'spa': '💆',
        'gym': '💪'
      };
      return catMap[categoryName?.toLowerCase()] || '🏢';
    };

    // Get price display
    const getPriceDisplay = (priceRange) => {
      const priceMap = {
        'inexpensive': '💰',
        'moderate': '💰💰',
        'expensive': '💰💰💰',
        'very_expensive': '💰💰💰💰',
        '$': '💰',
        '$$': '💰💰',
        '$$$': '💰💰💰',
        '$$$$': '💰💰💰💰'
      };
      return priceMap[priceRange] || '';
    };

    return (
      <Link to={`/business/${business.slug || business.id}`} className="group block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img 
              src={imageUrl}
              alt={business.name || 'Business'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
              }}
            />
            
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {business.is_featured && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
                  Featured
                </span>
              )}
              {business.is_premium && (
                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg">
                  Premium
                </span>
              )}
            </div>
            
            {(business.views || 0) > 0 && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <FiEye className="text-white text-sm" />
                <span className="text-white text-xs">{business.views}</span>
              </div>
            )}

            {(business.rating || 0) > 0 && (
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <FiStar className="text-yellow-400 text-sm fill-yellow-400" />
                <span className="text-white text-xs font-medium">{Number(business.rating).toFixed(1)}</span>
                <span className="text-white/60 text-xs">({business.review_count || 0})</span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                {business.name || 'Untitled Business'}
              </h3>
              <span className="text-xl flex-shrink-0 ml-2">{getCategoryIcon(business.category?.name)}</span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <FiMapPin className="text-xs flex-shrink-0" />
              {business.neighborhood || business.location || business.city || 'Tbilisi'}
            </p>
            
            {business.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {business.description}
              </p>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              {business.price_range && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getPriceDisplay(business.price_range)}
                </span>
              )}
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {business.category?.name || 'Business'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Discover the Best of Tbilisi | Businesses, Restaurants & More</title>
        <meta name="description" content="Discover the best businesses, restaurants, cafés, hotels, and services in Tbilisi, Georgia." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Discover the Best of <br />
              <span className="text-yellow-300">Tbilisi</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find businesses, restaurants, cafés, hotels, and more in Georgia's vibrant capital
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 md:p-4 relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search businesses, restaurants, hotels, or anything in Tbilisi..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <span className="text-xl">{suggestion.text.split(' ')[0]}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {suggestion.text}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.description}
                            </p>
                          </div>
                          <span className="ml-auto text-xs text-gray-400">
                            {suggestion.type === 'category' ? 'Category' : 
                             suggestion.type === 'location' ? 'Location' : 'Search'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <FiSearch className="text-lg" />
                  Search
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-blue-200">Popular:</span>
              {['Restaurants', 'Hotels', 'Businesses', 'Cafés'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    const intent = detectSearchIntent(term);
                    if (intent.type === 'category') {
                      navigate(`/businesses?category=${intent.value}`);
                    } else {
                      navigate(`/businesses?search=${term}`);
                    }
                  }}
                  className="text-sm text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Explore Categories
            </h2>
            <Link to="/businesses" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <FiArrowRight className="text-sm" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={`/businesses?category=${category.slug}`}
                  className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`p-3 rounded-xl ${category.bg} mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className={`text-2xl ${category.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ad Banner - Top */}
      <div className="container mx-auto px-4 mt-8">
        {useDemoAds ? (
          <DemoAdBanner 
            placement="homepage_top" 
            onAdClick={() => {
              console.log('📊 Ad Clicked: Homepage Top');
              navigate('/businesses');
            }}
          />
        ) : (
          <AdBanner placement="homepage_top" />
        )}
      </div>

      {/* Featured Businesses - DYNAMIC from database */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Businesses
            </h2>
            <Link to="/businesses" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <FiArrowRight className="text-sm" />
            </Link>
          </div>
          
          {error ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-lg">Error loading businesses</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchBusinesses}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : featuredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="text-4xl mb-3">🏢</div>
              <p className="text-lg">No featured businesses yet</p>
              <p className="text-sm mt-1">Check back soon for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad Banner - Middle */}
      <div className="container mx-auto px-4">
        {useDemoAds ? (
          <DemoAdBanner 
            placement="homepage_middle"
            onAdClick={() => {
              console.log('📊 Ad Clicked: Homepage Middle');
              navigate('/businesses');
            }}
          />
        ) : (
          <AdBanner placement="homepage_middle" />
        )}
      </div>

      {/* Popular Businesses - DYNAMIC from database */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Popular Businesses
            </h2>
            <Link to="/businesses" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <FiArrowRight className="text-sm" />
            </Link>
          </div>
          
          {error ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-lg">Error loading businesses</p>
              <button
                onClick={fetchBusinesses}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : popularBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-xl">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-lg">No businesses available</p>
              <p className="text-sm mt-1">Start exploring to find great businesses</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad Banner - Bottom */}
      <div className="container mx-auto px-4 my-8">
        {useDemoAds ? (
          <DemoAdBanner 
            placement="homepage_bottom"
            onAdClick={() => {
              console.log('📊 Ad Clicked: Homepage Bottom');
              navigate('/businesses');
            }}
          />
        ) : (
          <AdBanner placement="homepage_bottom" />
        )}
      </div>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find the Best Businesses in Tbilisi</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse hundreds of businesses, restaurants, hotels, and services in Georgia's capital.
          </p>
          <Link
            to="/businesses"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all hover:shadow-lg"
          >
            Explore Businesses
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">DevXLine</span>
      </div>
    </>
  );
};

export default HomePage;