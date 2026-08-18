// models/Location.js - MODIFIED
const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: 'Tbilisi'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    // ✅ NEW: For real estate
    average_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    property_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // ✅ NEW: For business directory (existing)
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'locations',
    timestamps: true
  });

  Location.beforeCreate(async (location) => {
    if (!location.slug) {
      const baseSlug = slugify(location.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Location.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      location.slug = slug;
    }
  });

  return Location;
};