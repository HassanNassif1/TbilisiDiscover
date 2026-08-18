import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FiMapPin, FiStar, FiClock, FiPhone, FiMail, FiGlobe, 
  FiShare2, FiHeart, FiArrowLeft, FiCalendar, FiTag,
  FiChevronLeft, FiChevronRight, FiUser, FiMessageCircle,
  FiThumbsUp, FiFlag, FiEdit2, FiPlus, FiX, FiCheck,
  FiExternalLink, FiInstagram, FiFacebook, FiTwitter
} from 'react-icons/fi';
import { FaUtensils, FaCoffee, FaGlassCheers, FaHotel, FaStore, FaSpa, FaDumbbell } from 'react-icons/fa';

import LoadingSpinner from '../components/common/LoadingSpinner';
import AdBanner from '../components/ads/AdBanner';
import DemoAdBanner from '../components/ads/DemoAdBanner';
import api from '../services/api';

const BusinessProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [userReview, setUserReview] = useState(null);
  const [useDemoAds, setUseDemoAds] = useState(true);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'deals', label: 'Deals' },
    { id: 'events', label: 'Events' },
  ];

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/businesses/${slug}`);
        setBusiness(response.data.data.business);
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const categoryIcon = {
    'restaurants': FaUtensils,
    'cafes': FaCoffee,
    'bars': FaGlassCheers,
    'hotels': FaHotel,
    'shops': FaStore,
    'spas': FaSpa,
    'gyms': FaDumbbell
  }[business?.category?.slug] || FiMapPin;

  const CategoryIcon = categoryIcon;

  const nextImage = () => {
    if (business?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % business.images.length);
    }
  };

  const prevImage = () => {
    if (business?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + business.images.length) % business.images.length);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Submit review logic here
    setShowReviewForm(false);
    setReviewText('');
    setReviewRating(5);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">The business you're looking for doesn't exist.</p>
        <Link to="/businesses" className="mt-4 inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  const coverImage = business.images?.find(img => img.is_cover)?.image_url || 
                     business.images?.[0]?.image_url || 
                     business.cover_image || 
                     business.logo;

  return (
    <>
      <Helmet>
        <title>{business.name} | Discover Tbilisi</title>
        <meta name="description" content={business.description || `Discover ${business.name} in Tbilisi, Georgia.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        {/* ============================================ */}
        {/* 🎯 AD BANNER - BUSINESS PROFILE TOP (DEMO) */}
        {/* ============================================ */}
        <div className="mb-6">
          {useDemoAds ? (
            <DemoAdBanner 
              placement="business_profile_top"
              onAdClick={() => {
                console.log('📊 Ad Clicked: Business Profile Top');
                navigate('/businesses?featured=true');
              }}
            />
          ) : (
            <AdBanner placement="business_profile_top" />
          )}
        </div>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-80 md:h-96 bg-gray-200 dark:bg-gray-700">
            {coverImage ? (
              <>
                <img 
                  src={coverImage}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
                {business.images && business.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <FiChevronLeft className="text-2xl" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <FiChevronRight className="text-2xl" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {business.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <CategoryIcon className="text-6xl text-white/50" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
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

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <FiHeart className={`text-xl ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-blue-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <FiTag className="text-xl" />
              </button>
              <button className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
                <FiShare2 className="text-xl" />
              </button>
            </div>
          </div>

          {/* Business Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </h1>
                  {business.rating > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      <FiStar className="fill-current text-sm" />
                      <span className="font-semibold">{parseFloat(business.rating).toFixed(1)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({business.review_count || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CategoryIcon className="text-sm" />
                  {business.category?.name || 'Business'}
                  {business.price_range && (
                    <span className="text-gray-400 dark:text-gray-500 ml-2">
                      {business.price_range}
                    </span>
                  )}
                </p>
                {business.neighborhood || business.city && (
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <FiMapPin className="text-sm" />
                    {[business.neighborhood, business.city, 'Tbilisi'].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiPhone className="text-sm" />
                    Call
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiGlobe className="text-sm" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {business.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Description */}
                {business.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    {business.address && (
                      <p className="flex items-center gap-2">
                        <FiMapPin className="text-gray-400" />
                        {business.address}
                      </p>
                    )}
                    {business.phone && (
                      <p className="flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        <a href={`tel:${business.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {business.phone}
                        </a>
                      </p>
                    )}
                    {business.email && (
                      <p className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <a href={`mailto:${business.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {business.email}
                        </a>
                      </p>
                    )}
                    {business.website && (
                      <p className="flex items-center gap-2">
                        <FiGlobe className="text-gray-400" />
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400">
                          {business.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Hours */}
                {business.hours && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hours</h3>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      {Object.entries(business.hours).map(([day, hours]) => (
                        <p key={day} className="flex justify-between">
                          <span className="capitalize">{day}</span>
                          <span>{hours}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {(business.social_media?.instagram || business.social_media?.facebook || business.social_media?.twitter) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Follow Us</h3>
                    <div className="flex gap-3">
                      {business.social_media?.instagram && (
                        <a href={business.social_media.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          <FiInstagram className="text-xl" />
                        </a>
                      )}
                      {business.social_media?.facebook && (
                        <a href={business.social_media.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          <FiFacebook className="text-xl" />
                        </a>
                      )}
                      {business.social_media?.twitter && (
                        <a href={business.social_media.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          <FiTwitter className="text-xl" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reviews ({business.review_count || 0})
                  </h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <FiEdit2 className="text-sm" />
                    Write a Review
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className="text-2xl focus:outline-none"
                            >
                              {rating <= reviewRating ? '⭐' : '☆'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Your Review
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows="4"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                          placeholder="Share your experience..."
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {business.reviews && business.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {business.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <FiUser className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {review.user?.full_name || 'Anonymous'}
                              </p>
                              <div className="flex gap-1 text-sm">
                                {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{review.content}</p>
                        <div className="flex gap-3 mt-2 text-sm text-gray-400 dark:text-gray-500">
                          <button className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
                            <FiThumbsUp /> Helpful
                          </button>
                          <button className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
                            <FiFlag /> Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deals & Offers</h3>
                {business.deals && business.deals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {business.deals.map((deal) => (
                      <div key={deal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{deal.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{deal.description}</p>
                        <p className="mt-2 text-lg font-bold text-green-600 dark:text-green-400">{deal.discount_percent}% OFF</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Expires: {new Date(deal.expires_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No deals available at the moment.
                  </p>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
                {business.events && business.events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {business.events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <FiCalendar className="text-sm" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No upcoming events.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* 🎯 AD BANNER - BUSINESS PROFILE BOTTOM (DEMO) */}
        {/* ============================================ */}
        <div className="mt-6">
          {useDemoAds ? (
            <DemoAdBanner 
              placement="business_profile_bottom"
              onAdClick={() => {
                console.log('📊 Ad Clicked: Business Profile Bottom');
                navigate('/businesses?category=restaurants');
              }}
            />
          ) : (
            <AdBanner placement="business_profile_bottom" />
          )}
        </div>
      </div>
    </>
  );
};

export default BusinessProfile;