// middleware/signupValidation.middleware.js

const Joi = require('joi');

const signupValidationSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must not exceed 50 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    repeat_password: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Password and repeat password do not match',
      'any.required': 'Repeat password is required',
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
     return next(error);
  }

  next();
};

module.exports = signupValidationSchema;
