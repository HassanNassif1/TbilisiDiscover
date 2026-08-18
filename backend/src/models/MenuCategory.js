module.exports = (sequelize, DataTypes) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    menu_id: {
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
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'menu_categories',
    timestamps: true
  });

  MenuCategory.associate = (models) => {
    MenuCategory.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
    MenuCategory.hasMany(models.MenuItem, { foreignKey: 'menu_category_id', as: 'items' });
  };

  return MenuCategory;
};