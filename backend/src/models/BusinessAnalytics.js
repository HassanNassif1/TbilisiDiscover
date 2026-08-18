module.exports = (sequelize, DataTypes) => {
  const BusinessAnalytics = sequelize.define('BusinessAnalytics', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    search_appearances: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    phone_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    website_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    map_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    menu_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    deal_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    booking_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'business_analytics',
    timestamps: true
  });

  BusinessAnalytics.associate = (models) => {
    BusinessAnalytics.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  return BusinessAnalytics;
};