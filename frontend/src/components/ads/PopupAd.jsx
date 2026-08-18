// src/components/ads/PopupAd.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

const PopupAd = ({ 
  delay = 5000,
  frequency = 60000,
  adContent = null,
  openInNewTab = true
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const defaultAd = {
    title: '📱 Download Our App',
    description: 'Discover Tbilisi on the go with our mobile app',
    color: 'from-indigo-600 to-blue-600',
    emoji: '📱',
    link: 'https://play.google.com',
    cta: 'Download Now',
    external: true  // ← Open in new tab
  };

  const ad = adContent || defaultAd;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
      setTimeout(() => setIsVisible(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const closePopup = () => {
    setIsVisible(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  if (!showPopup) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-[9999] max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 relative">
        <button 
          onClick={closePopup}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FiX className="text-xl" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="text-4xl">{ad.emoji}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{ad.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{ad.description}</p>
            
            {ad.external ? (
              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closePopup}
                className={`mt-3 inline-block px-4 py-2 bg-gradient-to-r ${ad.color} text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-1`}
              >
                {ad.cta}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <Link
                to={ad.link}
                onClick={closePopup}
                className={`mt-3 inline-block px-4 py-2 bg-gradient-to-r ${ad.color} text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all`}
              >
                {ad.cta}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupAd;