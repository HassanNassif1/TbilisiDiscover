// models/Agent.js
module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define('Agent', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    years_experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // ✅ Contact Preferences
    show_phone: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    show_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    contact_hours: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Mon-Fri 9:00 AM - 6:00 PM'
    },
    response_time: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Within 24 hours'
    },
    // ✅ NEW: Notification Settings
    notification_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    notification_sms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    // ✅ NEW: Additional Agent Settings
    notification_property_matches: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    notification_messages: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    notification_marketing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'agents',
    timestamps: true,
    underscored: true
  });

  // ✅ Associations
  Agent.associate = (models) => {
    Agent.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Agent.hasMany(models.Property, {
      foreignKey: 'agent_id',
      as: 'properties'
    });
  };

  return Agent;
};