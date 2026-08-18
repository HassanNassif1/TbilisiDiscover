module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'business_id']
      }
    ]
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Favorite.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  return Favorite;
};