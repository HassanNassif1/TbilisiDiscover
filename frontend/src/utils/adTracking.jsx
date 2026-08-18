// src/utils/adTracking.js

export const trackAdClick = (adName, placement, link) => {
  console.log(`📊 Ad Click: ${adName} | ${placement} | ${link}`);
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'ad_click', {
      ad_name: adName,
      placement: placement,
      link: link
    });
  }
  
  // Send to your backend
  fetch('/api/analytics/ad-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adName, placement, link })
  }).catch(err => console.error('Analytics error:', err));
};

export const trackAdImpression = (adName, placement) => {
  console.log(`👁️ Ad Impression: ${adName} | ${placement}`);
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'ad_impression', {
      ad_name: adName,
      placement: placement
    });
  }
};