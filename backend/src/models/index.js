const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Import existing models
db.User = require('./User')(sequelize, Sequelize);
db.Business = require('./Business')(sequelize, Sequelize);
db.Category = require('./Category')(sequelize, Sequelize);
db.Location = require('./Location')(sequelize, Sequelize);
db.BusinessImage = require('./BusinessImage')(sequelize, Sequelize);
db.BusinessHour = require('./BusinessHour')(sequelize, Sequelize);
db.Service = require('./Service')(sequelize, Sequelize);
db.Menu = require('./Menu')(sequelize, Sequelize);
db.MenuCategory = require('./MenuCategory')(sequelize, Sequelize);
db.MenuItem = require('./MenuItem')(sequelize, Sequelize);
db.Review = require('./Review')(sequelize, Sequelize);
db.Favorite = require('./Favorite')(sequelize, Sequelize);
db.Deal = require('./Deal')(sequelize, Sequelize);
db.Event = require('./Event')(sequelize, Sequelize);
db.SubscriptionPlan = require('./SubscriptionPlan')(sequelize, Sequelize);
db.Subscription = require('./Subscription')(sequelize, Sequelize);
db.Payment = require('./Payment')(sequelize, Sequelize);
db.AdvertisingPackage = require('./AdvertisingPackage')(sequelize, Sequelize);
db.AdvertisingCampaign = require('./AdvertisingCampaign')(sequelize, Sequelize);
db.BusinessAnalytics = require('./BusinessAnalytics')(sequelize, Sequelize);
db.Report = require('./Report')(sequelize, Sequelize);
db.Notification = require('./Notification')(sequelize, Sequelize);
db.AuditLog = require('./AuditLog')(sequelize, Sequelize);

// ✅ NEW: Import Real Estate Models
db.Property = require('./Property')(sequelize, Sequelize);
db.PropertyImage = require('./PropertyImage')(sequelize, Sequelize);
db.PropertyRequest = require('./PropertyRequest')(sequelize, Sequelize);
db.Agent = require('./Agent')(sequelize, Sequelize);
db.SavedProperty = require('./SavedProperty')(sequelize, Sequelize);
db.RealEstateLocation = require('./RealEstateLocation')(sequelize, Sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;