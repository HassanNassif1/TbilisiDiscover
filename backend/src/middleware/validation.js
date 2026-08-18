const { body, param, query, validationResult } = require('express-validator');

// Main validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

// Common validators
const validateUUID = (field = 'id') => {
  return param(field)
    .isUUID()
    .withMessage(`Invalid ${field} format`);
};

const validateEmail = () => {
  return body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format');
};

const validatePassword = (field = 'password') => {
  return body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');
};

const validatePhone = () => {
  return body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
    .withMessage('Invalid phone number format');
};

const validateSlug = () => {
  return body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens');
};

const validateURL = (field = 'website') => {
  return body(field)
    .optional()
    .isURL()
    .withMessage('Invalid URL format');
};

// Business validation
const validateBusiness = () => {
  return [
    body('name').notEmpty().withMessage('Business name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('category_id').isUUID().withMessage('Valid category is required'),
    validatePhone(),
    validateURL('website')
  ];
};

// Review validation
const validateReview = () => {
  return [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isLength({ max: 255 }).withMessage('Title too long'),
    body('content').optional().isLength({ max: 2000 }).withMessage('Content too long')
  ];
};

// Deal validation
const validateDeal = () => {
  return [
    body('title').notEmpty().withMessage('Deal title is required'),
    body('starts_at').isISO8601().withMessage('Valid start date is required'),
    body('expires_at').isISO8601().withMessage('Valid expiry date is required'),
    body('discount_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
    body('price').optional().isNumeric().withMessage('Invalid price')
  ];
};

// Event validation
const validateEvent = () => {
  return [
    body('title').notEmpty().withMessage('Event title is required'),
    body('event_date').isISO8601().withMessage('Valid event date is required'),
    body('category').optional(),
    body('is_free').optional().isBoolean(),
    body('price').optional().isNumeric().withMessage('Invalid price')
  ];
};

// User validation
const validateUser = () => {
  return [
    body('full_name').notEmpty().withMessage('Full name is required'),
    validateEmail(),
    validatePassword(),
    validatePhone()
  ];
};

// User update validation
const validateUserUpdate = () => {
  return [
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().matches(/^\+?[\d\s\-\(\)]{7,20}$/).withMessage('Invalid phone number format'),
    body('profile_image').optional().isURL().withMessage('Invalid image URL')
  ];
};

module.exports = {
  validate,
  validateUUID,
  validateEmail,
  validatePassword,
  validatePhone,
  validateSlug,
  validateURL,
  validateBusiness,
  validateReview,
  validateDeal,
  validateEvent,
  validateUser,
  validateUserUpdate
};