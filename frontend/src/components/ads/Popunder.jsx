// components/ads/PopunderAd.jsx - Professional version
import React, { useEffect, useRef } from 'react';

const PopunderAd = ({ 
  children,
  adUrl = 'https://your-ad-link.com',
  trigger = 'anywhere', // 'anywhere', 'links', 'clicks', 'exit'
  clickThreshold = 3,
  delay = 500,
  frequency = 1, // How many times per session
  excludedSelectors = '.no-popunder' // Don't trigger on these elements
}) => {
  const clickCount = useRef(0);
  const impressions = useRef(0);

  useEffect(() => {
    const handleClick = (e) => {
      // Check if clicking excluded element
      if (excludedSelectors && e.target.closest(excludedSelectors)) {
        return;
      }

      let shouldOpen = false;

      switch (trigger) {
        case 'anywhere':
          shouldOpen = true;
          break;
        case 'links':
          shouldOpen = e.target.closest('a') !== null;
          break;
        case 'clicks':
          clickCount.current++;
          if (clickCount.current >= clickThreshold) {
            shouldOpen = true;
            clickCount.current = 0;
          }
          break;
        case 'exit':
          // Exit intent handled separately
          return;
        default:
          return;
      }

      if (shouldOpen && impressions.current < frequency) {
        setTimeout(() => {
          window.open(adUrl, '_blank');
          impressions.current++;
        }, delay);
      }
    };

    // Exit intent handler
    const handleExitIntent = (e) => {
      if (trigger === 'exit' && e.clientY <= 0 && impressions.current < frequency) {
        setTimeout(() => {
          window.open(adUrl, '_blank');
          impressions.current++;
        }, delay);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleExitIntent);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleExitIntent);
    };
  }, [adUrl, trigger, clickThreshold, delay, frequency, excludedSelectors]);

  return <>{children}</>;
};

export default PopunderAd;