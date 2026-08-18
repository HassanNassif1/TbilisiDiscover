// scripts/addLocations.js
const db = require('../models');
const sequelize = require('../config/database');

const addLocations = async () => {
  try {
    const locations = [
      { name: 'Vake', slug: 'vake', description: 'Upscale residential area', is_active: true },
      { name: 'Saburtalo', slug: 'saburtalo', description: 'Popular residential area', is_active: true },
      { name: 'Old Tbilisi', slug: 'old-tbilisi', description: 'Historic center', is_active: true },
      { name: 'Mtatsminda', slug: 'mtatsminda', description: 'Prestigious area with views', is_active: true },
      { name: 'Vera', slug: 'vera', description: 'Central trendy area', is_active: true },
      { name: 'Chughureti', slug: 'chughureti', description: 'Emerging neighborhood', is_active: true },
      { name: 'Avlabari', slug: 'avlabari', description: 'Historic district', is_active: true },
      { name: 'Didube', slug: 'didube', description: 'Residential with transport links', is_active: true },
      { name: 'Gldani', slug: 'gldani', description: 'Affordable housing', is_active: true },
      { name: 'Isani', slug: 'isani', description: 'Developing area', is_active: true },
      { name: 'Samgori', slug: 'samgori', description: 'Industrial/residential area', is_active: true },
      { name: 'Krkheli', slug: 'krkheli', description: 'Peaceful suburban area', is_active: true }
    ];

    await db.RealEstateLocation.bulkCreate(locations);
    console.log('✅ Locations added successfully!');
  } catch (error) {
    console.error('❌ Error adding locations:', error);
  } finally {
    process.exit();
  }
};

addLocations();