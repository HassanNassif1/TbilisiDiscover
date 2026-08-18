// seeders/20240101000000-real-estate-locations.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('real_estate_locations', [
      { name: 'Vake', slug: 'vake', description: 'Upscale residential area with parks and embassies', average_price: 350000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Saburtalo', slug: 'saburtalo', description: 'Popular residential area with shopping malls', average_price: 280000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Old Tbilisi', slug: 'old-tbilisi', description: 'Historic center with traditional architecture', average_price: 420000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Mtatsminda', slug: 'mtatsminda', description: 'Prestigious area with stunning views', average_price: 500000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Vera', slug: 'vera', description: 'Central area with trendy cafes and shops', average_price: 310000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Chughureti', slug: 'chughureti', description: 'Emerging neighborhood with cool vibe', average_price: 220000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Avlabari', slug: 'avlabari', description: 'Historic district with traditional houses', average_price: 250000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Didube', slug: 'didube', description: 'Residential area with good transport links', average_price: 180000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Gldani', slug: 'gldani', description: 'Affordable housing area', average_price: 120000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Isani', slug: 'isani', description: 'Developing residential area', average_price: 150000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Samgori', slug: 'samgori', description: 'Industrial and residential area', average_price: 130000, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Krkheli', slug: 'krkheli', description: 'Peaceful suburban area', average_price: 160000, is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('real_estate_locations', null, {});
  }
};