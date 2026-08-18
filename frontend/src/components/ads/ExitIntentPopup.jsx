// src/components/ads/ExitIntentPopup.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

const ExitIntentPopup = ({ adContent = null }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const defaultAd = {
    title: '👋 Wait! Don\'t Leave Yet!',
    description: 'Sign up for our newsletter and get exclusive deals',
    color: 'from-orange-500 to-red-600',
    emoji: '📧',
    link: '/register',
    cta: 'Subscribe Now'
  };

  const ad = adContent || defaultAd;

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setShowPopup(true);
        setTimeout(() => setIsVisible(true), 50);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  if (!showPopup) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={closePopup}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX className="text-2xl" />
        </button>

        <div className="text-6xl mb-4">{ad.emoji}</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {ad.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {ad.description}
        </p>
        
        <Link
          to={ad.link}
          onClick={closePopup}
          className={`inline-block w-full py-3 bg-gradient-to-r ${ad.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all`}
        >
          {ad.cta}
        </Link>
        
        <button
          onClick={closePopup}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          No thanks, continue browsing
        </button>
      </div>
    </div>
  );
};

export default ExitIntentPopup;