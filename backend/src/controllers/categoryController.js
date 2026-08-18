const { Category, Business } = require('../models');
const slugify = require('slugify');

// ============================================
// GET ALL CATEGORIES
// ============================================
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['name', 'ASC']]
    });

    return res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};

// ============================================
// GET CATEGORY BY SLUG
// ============================================
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, is_active: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category'
    });
  }
};

// ============================================
// GET BUSINESSES BY CATEGORY
// ============================================
exports.getCategoryBusinesses = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { count, rows } = await Business.findAndCountAll({
      where: {
        category_id: id,
        status: 'active'
      },
      include: [
        { model: Category, as: 'category' }
      ],
      order: [['rating', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        businesses: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get category businesses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category businesses'
    });
  }
};

// ============================================
// CREATE CATEGORY
// ============================================
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, parent_id, display_order } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: name }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });
    
    // Check if slug exists and make it unique
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await Category.findOne({ where: { slug: finalSlug } });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create category
    const category = await Category.create({
      name,
      slug: finalSlug,
      icon: icon || '',
      parent_id: parent_id || null,
      display_order: display_order || 0,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category: ' + error.message
    });
  }
};

// ============================================
// UPDATE CATEGORY
// ============================================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, parent_id, display_order, is_active } = req.body;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: name }
      });
      if (existingCategory && existingCategory.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Prepare updates
    const updates = {};
    if (name) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (parent_id !== undefined) updates.parent_id = parent_id || null;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update slug if name changed
    if (name && name !== category.name) {
      let slug = slugify(name, { lower: true, strict: true });
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existing = await Category.findOne({ 
          where: { 
            slug: finalSlug,
            id: { [require('sequelize').Op.ne]: id }
          } 
        });
        if (!existing) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      updates.slug = finalSlug;
    }

    // Update category
    await category.update(updates);

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category: ' + error.message
    });
  }
};

// ============================================
// DELETE CATEGORY
// ============================================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has businesses
    const businessCount = await Business.count({
      where: { category_id: id }
    });

    if (businessCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${businessCount} businesses associated with it.`
      });
    }

    // Delete category
    await category.destroy();

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category: ' + error.message
    });
  }
};

// ============================================
// GET CATEGORY BY ID
// ============================================
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category'
    });
  }
};