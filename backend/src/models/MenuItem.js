module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    menu_category_id: {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'GEL'
    },
    image_url: {
      type: DataTypes.STRING(500)
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dietary_info: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'menu_items',
    timestamps: true
  });

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'menu_category_id', as: 'category' });
  };

  return MenuItem;
};