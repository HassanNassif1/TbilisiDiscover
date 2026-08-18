// src/components/ads/AdManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdManager = () => {
  const [adsEnabled, setAdsEnabled] = useState(
    import.meta.env.VITE_ADS_ENABLED === 'true'
  );
  const [adUnits, setAdUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultAdUnits = [
    { id: 'homepage_top', name: 'Homepage Top', size: '728x90', slotId: '4642690221', active: true },
    { id: 'homepage_middle', name: 'Homepage Middle', size: '728x90', slotId: '4451118538', active: true },
    { id: 'homepage_bottom', name: 'Homepage Bottom', size: '728x90', slotId: '7276592422', active: true },
    { id: 'sidebar', name: 'Sidebar', size: '300x250', slotId: '5963510756', active: true },
    { id: 'in_article', name: 'In Article', size: '468x60', slotId: '1824955193', active: true },
  ];

  useEffect(() => {
    const savedSettings = localStorage.getItem('adSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAdUnits(settings.adUnits || defaultAdUnits);
        setAdsEnabled(settings.adsEnabled !== undefined ? settings.adsEnabled : true);
      } catch (e) {
        setAdUnits(defaultAdUnits);
      }
    } else {
      setAdUnits(defaultAdUnits);
    }
    setLoading(false);
  }, []);

  const saveSettings = () => {
    const settings = { adUnits, adsEnabled };
    localStorage.setItem('adSettings', JSON.stringify(settings));
    toast.success('✅ Ad settings saved successfully!');
    // ✅ NO AUTO-REFRESH - user refreshes manually
  };

  const toggleAdUnit = (id) => {
    setAdUnits(prev => 
      prev.map(unit => 
        unit.id === id ? { ...unit, active: !unit.active } : unit
      )
    );
  };

  const updateAdSlot = (id, slotId) => {
    setAdUnits(prev => 
      prev.map(unit => 
        unit.id === id ? { ...unit, slotId } : unit
      )
    );
  };

  if (loading) return <div className="text-center py-4 text-gray-500">Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ad Manager</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">Ads Enabled:</span>
            <input
              type="checkbox"
              checked={adsEnabled}
              onChange={(e) => setAdsEnabled(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adUnits.map((unit) => (
          <div key={unit.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unit.active}
                  onChange={() => toggleAdUnit(unit.id)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">{unit.name}</span>
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{unit.size}</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={unit.slotId || ''}
                onChange={(e) => updateAdSlot(unit.id, e.target.value)}
                placeholder="Ad Slot ID"
                className="flex-1 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-400">Slot ID</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Status: {unit.active ? '🟢 Active' : '🔴 Inactive'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Instructions</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Go to <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google AdSense</a></li>
          <li>2. Create ad units and copy the ad slot IDs</li>
          <li>3. Paste the slot IDs in the fields above</li>
          <li>4. Toggle ads on/off as needed</li>
          <li>5. Click "Save Settings" to apply changes</li>
          <li>6. <strong>Refresh the page manually</strong> to see changes</li>
        </ul>
      </div>
    </div>
  );
};

export default AdManager;