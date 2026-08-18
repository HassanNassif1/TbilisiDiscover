// scripts/syncDatabase.js
const db = require('../models');
const sequelize = require('../config/database');

const syncDatabase = async () => {
  try {
    console.log('🔄 Starting database sync...');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synced successfully!');
    
    // ============================================
    // SEED REAL ESTATE LOCATIONS
    // ============================================
    const locationCount = await db.RealEstateLocation?.count() || 0;
    if (locationCount === 0) {
      console.log('📦 Seeding real estate locations...');
      const locations = [
        { name: 'Vake', slug: 'vake', description: 'Upscale residential area with parks and embassies', average_price: 350000 },
        { name: 'Saburtalo', slug: 'saburtalo', description: 'Popular residential area with shopping malls', average_price: 280000 },
        { name: 'Old Tbilisi', slug: 'old-tbilisi', description: 'Historic center with traditional architecture', average_price: 420000 },
        { name: 'Mtatsminda', slug: 'mtatsminda', description: 'Prestigious area with stunning views', average_price: 500000 },
        { name: 'Vera', slug: 'vera', description: 'Central area with trendy cafes and shops', average_price: 310000 },
        { name: 'Chughureti', slug: 'chughureti', description: 'Emerging neighborhood with cool vibe', average_price: 220000 },
        { name: 'Avlabari', slug: 'avlabari', description: 'Historic district with traditional houses', average_price: 250000 },
        { name: 'Didube', slug: 'didube', description: 'Residential area with good transport links', average_price: 180000 },
        { name: 'Gldani', slug: 'gldani', description: 'Affordable housing area', average_price: 120000 },
        { name: 'Isani', slug: 'isani', description: 'Developing residential area', average_price: 150000 },
        { name: 'Samgori', slug: 'samgori', description: 'Industrial and residential area', average_price: 130000 },
        { name: 'Krkheli', slug: 'krkheli', description: 'Peaceful suburban area', average_price: 160000 }
      ];
      await db.RealEstateLocation.bulkCreate(locations);
      console.log('✅ Real Estate Locations seeded successfully!');
    } else {
      console.log(`✅ Locations already exist (${locationCount} found)`);
    }
    
    console.log('✅ All done!');
    
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    console.error(error.stack);
  } finally {
    process.exit();
  }
};

syncDatabase();