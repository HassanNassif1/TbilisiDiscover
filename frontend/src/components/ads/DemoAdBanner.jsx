// src/components/ads/DemoAdBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const DemoAdBanner = ({ placement, className = '', onAdClick, openInNewTab = true }) => {
  const getAdContent = () => {
    const ads = {
      // Homepage Ads
      'homepage_top': {
        title: '🎉 Discover Tbilisi\'s Best Restaurants',
        description: 'Explore top-rated dining experiences in Georgia\'s capital',
        color: 'from-blue-500 to-purple-600',
        emoji: '🍽️',
        link: '/businesses?category=restaurants',
        cta: 'Explore Restaurants →',
        external: false  // Internal link
      },
      'homepage_middle': {
        title: '🏨 Book Your Dream Stay in Tbilisi',
        description: 'Find the perfect hotel for your next visit',
        color: 'from-green-500 to-teal-600',
        emoji: '🏨',
        link: '/businesses?category=hotels',
        cta: 'Find Hotels →',
        external: false
      },
      'homepage_bottom': {
        title: '☕ Experience Authentic Georgian Coffee',
        description: 'Visit the best cafes in Tbilisi old town',
        color: 'from-orange-500 to-red-600',
        emoji: '☕',
        link: '/businesses?category=cafes',
        cta: 'Find Cafes →',
        external: false
      },
      
      // Directory Ads
      'directory_top': {
        title: '🔥 Hot Deals in Tbilisi',
        description: 'Discover exclusive discounts at top restaurants and hotels',
        color: 'from-red-500 to-pink-600',
        emoji: '🔥',
        link: 'https://www.booking.com',  // ← External link
        cta: 'View Deals →',
        external: true  // ← Open in new tab!
      },
      'directory_bottom': {
        title: '⭐ List Your Business Today',
        description: 'Reach thousands of customers in Tbilisi',
        color: 'from-purple-500 to-indigo-600',
        emoji: '⭐',
        link: '/business/register',
        cta: 'Get Started →',
        external: false
      },
      
      // Business Profile Ads
      'business_profile_top': {
        title: '📢 Promote Your Business',
        description: 'Get featured and reach more customers in Tbilisi',
        color: 'from-yellow-500 to-orange-600',
        emoji: '📢',
        link: 'https://www.tripadvisor.com',  // ← External link
        cta: 'Learn More →',
        external: true  // ← Open in new tab!
      },
      'business_profile_bottom': {
        title: '📱 Follow Us on Social Media',
        description: 'Stay updated with the latest news and exclusive deals',
        color: 'from-blue-600 to-cyan-600',
        emoji: '📱',
        link: 'https://www.instagram.com',
        cta: 'Follow Us →',
        external: true  // ← Open in new tab!
      },
      
      // Sidebar Ads
      'sidebar': {
        title: '✨ Premium Business Listing',
        description: 'Reach thousands of customers daily',
        color: 'from-purple-500 to-pink-600',
        emoji: '⭐',
        link: '/business/register',
        cta: 'List Your Business →',
        external: false
      },
      'in_article': {
        title: '📱 Download Our App',
        description: 'Discover Tbilisi on the go',
        color: 'from-indigo-500 to-blue-600',
        emoji: '📱',
        link: 'https://play.google.com',  // ← External link
        cta: 'Download Now →',
        external: true  // ← Open in new tab!
      }
    };
    return ads[placement] || ads['homepage_top'];
  };

  const ad = getAdContent();

  const handleClick = (e) => {
    if (onAdClick) {
      onAdClick();
    }
  };

  // For internal links (React Router)
  if (!ad.external) {
    return (
      <div className={`demo-ad-wrapper ${className}`}>
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
          🧪 Sponsored Content
        </div>
        
        <Link 
          to={ad.link}
          onClick={handleClick}
          className={`block bg-gradient-to-r ${ad.color} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{ad.emoji}</div>
              <div>
                <h3 className="text-lg font-bold">{ad.title}</h3>
                <p className="text-sm text-white/80">{ad.description}</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm whitespace-nowrap">
              {ad.cta}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/50">
            📍 {placement.replace('_', ' ').toUpperCase()} • Sponsored
          </div>
        </Link>
      </div>
    );
  }

  // For external links (opens in new tab)
  return (
    <div className={`demo-ad-wrapper ${className}`}>
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
        🧪 Sponsored Content
      </div>
      
      <a 
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`block bg-gradient-to-r ${ad.color} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{ad.emoji}</div>
            <div>
              <h3 className="text-lg font-bold">{ad.title}</h3>
              <p className="text-sm text-white/80">{ad.description}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm whitespace-nowrap flex items-center gap-1">
            {ad.cta}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
        <div className="mt-2 text-xs text-white/50">
          📍 {placement.replace('_', ' ').toUpperCase()} • Sponsored • Opens in new tab
        </div>
      </a>
    </div>
  );
};

export default DemoAdBanner;