// models/PropertyRequest.js
module.exports = (sequelize, DataTypes) => {
  const PropertyRequest = sequelize.define('PropertyRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('rent', 'buy'),
      defaultValue: 'rent'
    },
    min_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    max_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'matched', 'completed', 'expired'),
      defaultValue: 'pending'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'property_requests',
    timestamps: true,
    underscored: true
  });

  // Associations
  PropertyRequest.associate = (db) => {
    PropertyRequest.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return PropertyRequest;
};