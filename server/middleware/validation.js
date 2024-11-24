const { body, validationResult } = require('express-validator');
const { logger } = require('./logger');

const searchValidation = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Query must be between 2 and 500 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    return res.status(400).json({ 
      error: 'Validation error',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  searchValidation,
  validate
};
