const ApiError = require('../utils/ApiError');

/**
 * Generic Joi validator. Pass a schema and which part of the request to
 * validate against ('body' | 'query' | 'params'). Defaults to 'body'.
 *
 * Usage: router.post('/login', validate(authValidation.login), controller.login)
 */
const validate = (schema, property = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new ApiError(400, message));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
