// models/Property.js
const slugify = require('slugify');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('rent', 'buy'),
      defaultValue: 'rent'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    sqft: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('available', 'pending', 'sold', 'rented'),
      defaultValue: 'available'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agents',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'properties',
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  // ✅ FIX: Auto-generate unique slug from title with counter
  Property.beforeCreate(async (property) => {
    if (!property.slug) {
      const baseSlug = slugify(property.title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      let slug = baseSlug;
      let counter = 1;
      
      // ✅ Keep checking until we find a unique slug
      while (true) {
        const existing = await Property.findOne({ 
          where: { slug },
          paranoid: false  // Include soft-deleted records
        });
        if (!existing) break;
        // ✅ If slug exists, append counter
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      property.slug = slug;
    }
  });

  // ✅ Handle updates - regenerate slug if title changes
  Property.beforeUpdate(async (property) => {
    if (property.changed('title') && !property.changed('slug')) {
      const baseSlug = slugify(property.title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existing = await Property.findOne({ 
          where: { 
            slug,
            id: { [Op.ne]: property.id }  // Exclude current property
          },
          paranoid: false
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      property.slug = slug;
    }
  });

  // ✅ Associations
  Property.associate = (db) => {
    Property.belongsTo(db.Agent, {
      foreignKey: 'agent_id',
      as: 'agent'
    });
    
    Property.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'owner'
    });
    
    // ✅ Images association with cascade delete
    Property.hasMany(db.PropertyImage, {
      foreignKey: 'property_id',
      as: 'images',
      onDelete: 'CASCADE',
      hooks: true
    });
    
    Property.hasMany(db.SavedProperty, {
      foreignKey: 'property_id',
      as: 'savedBy'
    });
  };

  return Property;
};