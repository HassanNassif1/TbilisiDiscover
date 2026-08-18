const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
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
    icon: {
      type: DataTypes.STRING(100)
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'categories',
    timestamps: true
  });

  Category.associate = (models) => {
    Category.hasMany(models.Business, { foreignKey: 'category_id', as: 'businesses' });
    Category.belongsTo(models.Category, { foreignKey: 'parent_id', as: 'parent' });
    Category.hasMany(models.Category, { foreignKey: 'parent_id', as: 'children' });
  };

  // ✅ Auto-generate slug before creation
  Category.beforeCreate(async (category) => {
    if (!category.slug) {
      const baseSlug = slugify(category.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Category.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      category.slug = slug;
    }
  });

  // ✅ Also handle before validate
  Category.beforeValidate(async (category) => {
    if (!category.slug) {
      const baseSlug = slugify(category.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Category.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      category.slug = slug;
    }
  });

  return Category;
};