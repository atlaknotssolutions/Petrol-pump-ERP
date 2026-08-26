const Joi = require('joi');

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];
const PAYMENT_METHODS = ['cash', 'upi', 'card', 'credit', 'other'];

const createSale = Joi.object({
  branchId: Joi.string().trim().required().messages({
    'any.required': 'Branch ID is required',
    'string.empty': 'Branch ID is required',
  }),
  fuelType: Joi.string()
    .valid(...FUEL_TYPES)
    .required()
    .messages({
      'any.only': `Fuel type must be one of: ${FUEL_TYPES.join(', ')}`,
      'any.required': 'Fuel type is required',
    }),
  nozzleId: Joi.string().trim().required().messages({
    'any.required': 'Nozzle ID is required',
    'string.empty': 'Nozzle ID is required',
  }),
  openingReading: Joi.number().min(0).required().messages({
    'number.min': 'Opening reading cannot be negative',
    'any.required': 'Opening reading is required',
  }),
  closingReading: Joi.number().min(0).required().custom((value, helpers) => {
    const { openingReading } = helpers.state.ancestors[0];
    if (openingReading !== undefined && value < openingReading) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'number.min': 'Closing reading cannot be negative',
    'any.required': 'Closing reading is required',
    'any.invalid': 'Closing reading must be greater than or equal to opening reading',
  }),
  fuelRatePerLitre: Joi.number().positive().required().messages({
    'number.positive': 'Fuel rate must be greater than 0',
    'any.required': 'Fuel rate per litre is required',
  }),
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .required()
    .messages({
      'any.only': `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      'any.required': 'Payment method is required',
    }),
  paymentReference: Joi.string().trim().max(100).allow(null, ''),
  notes: Joi.string().trim().max(500).allow(null, ''),
  saleDate: Joi.date().iso(),
});

const listSalesQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  branchId: Joi.string().trim().allow('', null).optional(),
  fuelType: Joi.string()
    .valid(...FUEL_TYPES)
    .allow('', null)
    .optional(),
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .allow('', null)
    .optional(),
  operatorId: Joi.string().trim().allow('', null).optional(),
  nozzleId: Joi.string().trim().allow('', null).optional(),
  startDate: Joi.date().iso().allow('', null).optional(),
  endDate: Joi.date().iso().allow('', null).optional(),
});

const summaryQuery = Joi.object({
  branchId: Joi.string().trim().allow('', null).optional(),
  fuelType: Joi.string()
    .valid(...FUEL_TYPES)
    .allow('', null)
    .optional(),
  startDate: Joi.date().iso().allow('', null).optional(),
  endDate: Joi.date().iso().allow('', null).optional(),
});

module.exports = {
  createSale,
  listSalesQuery,
  summaryQuery,
};
