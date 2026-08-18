// src/components/ads/AdBanner.jsx
import React, { useEffect, useRef, useState } from 'react';

const AdBanner = ({ 
  placement, 
  className = '',
  adSlot = '',
  adFormat = 'auto',
  adLayout = '',
  fullWidthResponsive = true,
  testMode = false
}) => {
  const adRef = useRef(null);
  const [adUnits, setAdUnits] = useState([]);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const testModeEnabled = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' || testMode;

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAdUnits(settings.adUnits || []);
        setAdsEnabled(settings.adsEnabled !== undefined ? settings.adsEnabled : true);
      } catch (e) {
        console.error('Error loading ad settings:', e);
      }
    } else {
      // Default test units
      const defaultUnits = [
        { id: 'homepage_top', name: 'Homepage Top', size: '728x90', slotId: '4642690221', active: true },
        { id: 'homepage_middle', name: 'Homepage Middle', size: '728x90', slotId: '4451118538', active: true },
        { id: 'homepage_bottom', name: 'Homepage Bottom', size: '728x90', slotId: '7276592422', active: true },
        { id: 'sidebar', name: 'Sidebar', size: '300x250', slotId: '5963510756', active: true },
        { id: 'in_article', name: 'In Article', size: '468x60', slotId: '1824955193', active: true }
      ];
      setAdUnits(defaultUnits);
    }
    setLoading(false);
  }, []);

  const getAdSlot = () => {
    const unit = adUnits.find(u => u.id === placement);
    if (unit && unit.active && unit.slotId) {
      return unit.slotId;
    }
    if (adSlot) return adSlot;
    return null;
  };

  const shouldShowAd = () => {
    if (!adsEnabled) return false;
    if (!publisherId) return false;
    
    const unit = adUnits.find(u => u.id === placement);
    if (!unit) return false;
    if (!unit.active) return false;
    if (!unit.slotId) return false;
    
    return true;
  };

  // Initialize AdSense
  useEffect(() => {
    if (shouldShowAd() && !loading) {
      try {
        if (!document.querySelector('#adsense-script')) {
          const script = document.createElement('script');
          script.id = 'adsense-script';
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    }
  }, [adsEnabled, publisherId, placement, adUnits, loading]);

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[100px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading ad...</p>
        </div>
      </div>
    );
  }

  // SHOW DEMO ADS - This will display nice-looking demo ads!
  if (testModeEnabled) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center border-2 border-blue-300 dark:border-blue-700 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[120px]">
          <div className="text-xs font-medium text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-2">
            🧪 Demo Advertisement
          </div>
          
          {/* Demo Ad Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  Ad
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    🎯 Discover Amazing Deals in Tbilisi
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Find the best restaurants, cafes, and hotels
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            📍 {placement.replace('_', ' ').toUpperCase()} • Demo Mode
          </div>
        </div>
      </div>
    );
  }

  if (!adsEnabled || !publisherId || !shouldShowAd()) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[100px]">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Advertisement</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ad placeholder - {placement}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your ad could be here</p>
          {!shouldShowAd() && (
            <span className="mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              ⚙️ Configure in Ad Manager
            </span>
          )}
        </div>
      </div>
    );
  }

  const slotId = getAdSlot();

  return (
    <div className={`ad-container ${className}`}>
      <div className="ad-label text-xs text-gray-400 dark:text-gray-500 text-center py-1">
        Advertisement
      </div>
      
      <div ref={adRef} className="ad-slot-wrapper flex justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={adFormat}
          data-ad-layout={adLayout}
          data-full-width-responsive={fullWidthResponsive}
          data-ad-test="on"
        />
      </div>

      <style jsx>{`
        .ad-container {
          position: relative;
          overflow: hidden;
          min-height: 100px;
        }
        .adsbygoogle {
          min-height: 100px;
        }
        @media (max-width: 768px) {
          .adsbygoogle {
            min-height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdBanner;