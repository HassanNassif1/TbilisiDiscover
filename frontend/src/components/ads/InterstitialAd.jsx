// src/components/ads/InterstitialAd.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

const InterstitialAd = ({ 
  children,
  triggerCount = 3,
  delay = 500,
  adContent = null,
  openInNewTab = true
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const defaultAd = {
    title: '🎉 Discover Amazing Deals!',
    description: 'Get exclusive discounts at the best restaurants and hotels in Tbilisi',
    color: 'from-blue-600 to-purple-600',
    emoji: '🎁',
    link: 'https://www.booking.com',
    cta: 'View Deals →',
    external: true  // ← Open in new tab
  };

  const ad = adContent || defaultAd;

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('.interstitial-ad') || e.target.closest('a')) {
        return;
      }
      
      setClickCount(prev => {
        const newCount = prev + 1;
        if (newCount >= triggerCount) {
          setShowAd(true);
          setTimeout(() => setIsVisible(true), 50);
          return 0;
        }
        return newCount;
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [triggerCount]);

  const closeAd = () => {
    setIsVisible(false);
    setTimeout(() => setShowAd(false), 300);
  };

  return (
    <>
      {children}
      
      {showAd && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeAd}
        >
          <div 
            className={`interstitial-ad bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 p-8 shadow-2xl transform transition-transform duration-300 ${
              isVisible ? 'scale-100' : 'scale-90'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeAd}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FiX className="text-2xl" />
            </button>

            <div className="text-center">
              <div className="text-6xl mb-4">{ad.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {ad.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {ad.description}
              </p>
              
              {ad.external ? (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeAd}
                  className={`inline-block w-full py-3 bg-gradient-to-r ${ad.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                  {ad.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  to={ad.link}
                  onClick={closeAd}
                  className={`inline-block w-full py-3 bg-gradient-to-r ${ad.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all`}
                >
                  {ad.cta}
                </Link>
              )}
              
              <button
                onClick={closeAd}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Skip Ad
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterstitialAd;