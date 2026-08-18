module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'menus',
    timestamps: true
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
    Menu.hasMany(models.MenuCategory, { foreignKey: 'menu_id', as: 'categories' });
  };

  return Menu;
};