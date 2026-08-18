module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING(255)
    },
    content: {
      type: DataTypes.TEXT
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['business_id', 'user_id']
      }
    ]
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
    Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Review;
};