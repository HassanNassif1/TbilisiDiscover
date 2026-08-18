// models/RealEstateLocation.js
const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const RealEstateLocation = sequelize.define('RealEstateLocation', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    average_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'real_estate_locations',
    timestamps: true,
    underscored: true
  });

  // Auto-generate slug from name
  RealEstateLocation.beforeCreate(async (location) => {
    if (!location.slug) {
      const baseSlug = slugify(location.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await RealEstateLocation.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      location.slug = slug;
    }
  });

  return RealEstateLocation;
};