const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
const AppError = require('../utils/AppError');
const constants = require('../config/constants');

// Content validation schema
const contentSchema = Joi.object({
  about: Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.array().items(Joi.string()).required()
  }).required(),

  services: Joi.array().items(
    Joi.object({
      icon: Joi.string().allow(''),
      title: Joi.string().required(),
      text: Joi.string().required()
    })
  ).default([]),

  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      category: Joi.string().allow(''),
      type: Joi.string().allow(''),
      image: Joi.string().allow(''),
      alt: Joi.string().allow(''),
      link: Joi.string().allow('')
    })
  ).default([]),

  testimonials: Joi.array().items(
    Joi.object({
      avatar: Joi.string().allow(''),
      name: Joi.string().required(),
      text: Joi.string().required()
    })
  ).default([]),

  certificates: Joi.array().items(
    Joi.object({
      logo: Joi.string().allow(''),
      alt: Joi.string().allow('')
    })
  ).default([]),

  education: Joi.array().items(
    Joi.object({
      school: Joi.string().required(),
      years: Joi.string().allow(''),
      text: Joi.string().allow('')
    })
  ).default([]),

  experience: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      company: Joi.string().allow(''),
      years: Joi.string().allow(''),
      text: Joi.string().allow('')
    })
  ).default([]),

  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.number().min(0).max(100).required()
    })
  ).default([]),

  siteSettings: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    keywords: Joi.string().allow(''),
    author: Joi.string().required(),
    siteUrl: Joi.string().uri().allow(''),
    avatar: Joi.string().allow(''),
    favicon: Joi.string().allow('')
  }).default({}),

  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    location: Joi.string().allow('')
  }).default({}),

  socialMedia: Joi.array().items(
    Joi.object({
      platform: Joi.string().required(),
      url: Joi.string().uri().required(),
      icon: Joi.string().required()
    })
  ).default([])
});

// Contact validation schema
const contactSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(2000).required()
});

// Validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new AppError(JSON.stringify(errors), constants.HTTP_STATUS.BAD_REQUEST));
    }
    
    req.body = value;
    next();
  };
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
};

// File size validation middleware
const validateFileSize = (req, res, next) => {
  const config = require('../config');
  const maxSize = config.MAX_FILE_SIZE;
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return next(new AppError(
      constants.ERROR_MESSAGES.FILE_TOO_LARGE, 
      constants.HTTP_STATUS.PAYLOAD_TOO_LARGE
    ));
  }
  next();
};

module.exports = {
  contentSchema,
  contactSchema,
  validateRequest,
  sanitizeInput,
  validateFileSize
};