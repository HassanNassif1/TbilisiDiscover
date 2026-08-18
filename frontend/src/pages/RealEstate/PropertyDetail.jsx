// pages/RealEstate/PropertyDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FiMapPin, FiStar, FiClock, FiPhone, FiMail, FiGlobe, 
  FiShare2, FiHeart, FiArrowLeft, FiCalendar, FiTag,
  FiChevronLeft, FiChevronRight, FiUser, FiMessageCircle,
  FiThumbsUp, FiFlag, FiEdit2, FiPlus, FiX, FiCheck,
  FiExternalLink, FiInstagram, FiFacebook, FiTwitter,
  FiHome, FiDollarSign, FiEye, FiShield, FiAward,
  FiArrowRight
} from 'react-icons/fi';
import { FaBed, FaBath, FaRulerCombined, FaParking } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DemoAdBanner from '../../components/ads/DemoAdBanner';
import api from '../../services/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        
        // ✅ Fetch property by ID
        const response = await api.get(`/real-estate/properties/${id}`);
        console.log('📊 Property details:', response.data.data);
        setProperty(response.data.data);
        
        // ✅ Fetch properties by the SAME AGENT
        if (response.data.data && response.data.data.agent_id) {
          const agentId = response.data.data.agent_id;
          console.log(`📡 Fetching properties for agent: ${agentId}`);
          
          // ✅ Get all properties from the same agent
          const similarRes = await api.get(`/real-estate/properties?agent_id=${agentId}&limit=10`);
          
          // ✅ Filter out the current property
          const similar = similarRes.data.data?.filter(p => p.id !== parseInt(id)) || [];
          setSimilarProperties(similar.slice(0, 4)); // Show up to 4 similar properties
          
          console.log(`✅ Found ${similar.length} properties from same agent`);
        }
      } catch (error) {
        console.error('❌ Error fetching property:', error);
        toast.error('Failed to load property details');
        navigate('/real-estate');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  // Handle image navigation
  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  // Handle phone number reveal
  const handleRevealPhone = () => {
    setShowPhone(true);
    console.log('📞 Phone number revealed for property:', property.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} in ${property.location}`,
        url: window.location.href
      }).catch(err => console.log('Share cancelled'));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">The property you're looking for doesn't exist.</p>
        <Link to="/real-estate" className="mt-4 inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          Back to Properties
        </Link>
      </div>
    );
  }

  // Get images for gallery
  const images = property.images && property.images.length > 0 
    ? property.images.map(img => img.image_url || img)
    : [property.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'];

  const mainImage = images[currentImageIndex] || images[0];

  // Get agent info
  const agent = property.agent || {};
  const agentPhone = agent.phone || '+995 555 123 456';
  const agentName = agent.name || 'Real Estate Agent';
  const agentCompany = agent.company || 'Independent Agent';

  // Similar Property Card
  const SimilarPropertyCard = ({ property }) => {
    let imageUrl = property.image;
    if (property.images && property.images.length > 0) {
      imageUrl = property.images[0].image_url || property.images[0];
    }
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
    }

    const propertyAgentName = property.agent?.name || 'Agent';

    return (
      <Link to={`/real-estate/${property.id}`} className="group block">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden hover:shadow-xl transition-all h-full">
          <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
              }}
            />
            <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
              property.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {property.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {property.is_featured && (
              <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-yellow-500 text-white rounded-full">
                ⭐
              </span>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {property.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiMapPin className="text-xs" />
              {property.location}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                ${property.price}
                {property.type === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
              </p>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiUser className="text-xs" />
                {propertyAgentName}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <Helmet>
        <title>{property.title} | Discover Tbilisi</title>
        <meta name="description" content={property.description || `View ${property.title} in ${property.location}, Tbilisi.`} />
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

        {/* Property Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-96 md:h-[500px] bg-gray-200 dark:bg-gray-700">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop';
              }}
            />
            
            {images.length > 1 && (
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
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                property.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {property.type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              {property.is_featured && (
                <span className="px-3 py-1 text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
                  ⭐ Featured
                </span>
              )}
              <span className="px-3 py-1 text-sm font-semibold bg-gray-800/80 text-white rounded-full">
                Status: {property.status || 'Available'}
              </span>
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
              <button
                onClick={handleShare}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <FiShare2 className="text-xl" />
              </button>
            </div>

            {/* View Count */}
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1 text-white text-sm">
              <FiEye className="text-sm" />
              {property.views || 0} views
            </div>
          </div>

          {/* Property Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {property.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <FiMapPin className="text-sm" />
                  {property.location} {property.address && `- ${property.address}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  ${property.price}
                  {property.type === 'rent' && <span className="text-base font-normal text-gray-400"> /month</span>}
                </span>
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <FaBed className="text-xl text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bedrooms</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{property.bedrooms || 0}</p>
              </div>
              <div className="text-center">
                <FaBath className="text-xl text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bathrooms</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{property.bathrooms || 0}</p>
              </div>
              <div className="text-center">
                <FaRulerCombined className="text-xl text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Square Feet</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{property.sqft || 0}</p>
              </div>
              <div className="text-center">
                <FiHome className="text-xl text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Property Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{property.type || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Description and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About This Property</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {property.description || 'No description available for this property.'}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiCheck className="text-green-500" />
                  <span>{property.bedrooms || 0} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiCheck className="text-green-500" />
                  <span>{property.bathrooms || 0} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiCheck className="text-green-500" />
                  <span>{property.sqft || 0} sqft</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiCheck className="text-green-500" />
                  <span>Status: {property.status || 'Available'}</span>
                </div>
                {property.is_featured && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="text-green-500" />
                    <span>⭐ Featured Property</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <FiMapPin className="text-3xl mx-auto mb-2" />
                  <p>{property.address || property.location || 'Tbilisi, Georgia'}</p>
                  <p className="text-sm">Map view coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Agent Contact */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Agent
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl font-medium">
                  {agentName?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {agentName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {agentCompany}
                  </p>
                  {agent.is_verified && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <FiShield className="text-xs" />
                      Verified Agent
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiClock className="text-sm" />
                <span>Usually responds in {agent.response_time || '24 hours'}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📞 Phone Number
                </p>
                
                {!showPhone ? (
                  <button
                    onClick={handleRevealPhone}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <FiPhone />
                    Reveal Phone Number
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agentPhone}
                    </span>
                    <a
                      href={`tel:${agentPhone}`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Call Now
                    </a>
                  </div>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {agent.contact_hours || 'Available Mon-Fri 9:00 AM - 6:00 PM'}
                </p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <FiShield className="text-sm" />
                  Contact the agent directly by phone for inquiries
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <FiShare2 />
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties - From Same Agent */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                More Properties by {agentName}
              </h2>
              <Link to={`/real-estate?agent=${property.agent_id}`} className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <FiArrowRight className="text-sm" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((property) => (
                <SimilarPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <div className="mt-8">
          <DemoAdBanner 
            placement="business_profile_bottom"
            onAdClick={() => {
              console.log('📊 Ad Clicked');
              navigate('/real-estate');
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PropertyDetail;