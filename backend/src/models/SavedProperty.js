// models/SavedProperty.js
module.exports = (sequelize, DataTypes) => {
  const SavedProperty = sequelize.define('SavedProperty', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id'
      }
    }
  }, {
    tableName: 'saved_properties',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'property_id']
      }
    ]
  });

  // Associations
  SavedProperty.associate = (db) => {
    SavedProperty.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    SavedProperty.belongsTo(db.Property, {
      foreignKey: 'property_id',
      as: 'property'
    });
  };

  return SavedProperty;
};