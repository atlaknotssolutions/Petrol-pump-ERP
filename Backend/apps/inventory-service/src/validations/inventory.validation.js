const Joi = require('joi');

const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'EV'];
const tankStatuses = ['active', 'inactive', 'maintenance'];

const createTank = Joi.object({
  branchId: Joi.string().trim().required().messages({
    'any.required': 'Branch ID is required',
    'string.empty': 'Branch ID is required',
  }),
  name: Joi.string().trim().max(100).required().messages({
    'any.required': 'Tank name is required',
    'string.empty': 'Tank name is required',
    'string.max': 'Tank name cannot exceed 100 characters',
  }),
  fuelType: Joi.string().valid(...fuelTypes).required().messages({
    'any.required': 'Fuel type is required',
    'any.only': 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
  }),
  capacity: Joi.number().positive().required().messages({
    'any.required': 'Capacity is required',
    'number.base': 'Capacity must be a number',
    'number.positive': 'Capacity must be positive',
  }),
  currentStock: Joi.number().min(0).default(0),
  minAlertLevel: Joi.number().min(0).optional().allow(null),
  status: Joi.string().valid(...tankStatuses).default('active'),
});

const updateTank = Joi.object({
  name: Joi.string().trim().max(100),
  capacity: Joi.number().positive(),
  minAlertLevel: Joi.number().min(0).allow(null),
  status: Joi.string().valid(...tankStatuses),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const listTanksQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  branchId: Joi.string().optional().allow('', null),
  fuelType: Joi.string().valid(...fuelTypes).optional().allow('', null),
  status: Joi.string().valid(...tankStatuses).optional().allow('', null),
});

const createPump = Joi.object({
  branchId: Joi.string().trim().required().messages({
    'any.required': 'Branch ID is required',
    'string.empty': 'Branch ID is required',
  }),
  name: Joi.string().trim().max(100).required().messages({
    'any.required': 'Pump name is required',
    'string.empty': 'Pump name is required',
    'string.max': 'Pump name cannot exceed 100 characters',
  }),
  pumpNumber: Joi.number().integer().positive().required().messages({
    'any.required': 'Pump number is required',
    'number.base': 'Pump number must be a number',
    'number.integer': 'Pump number must be an integer',
    'number.positive': 'Pump number must be positive',
  }),
  status: Joi.string().valid(...tankStatuses).default('active'),
});

const updatePump = Joi.object({
  name: Joi.string().trim().max(100),
  status: Joi.string().valid(...tankStatuses),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const listPumpsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  branchId: Joi.string().optional().allow('', null),
  status: Joi.string().valid(...tankStatuses).optional().allow('', null),
});

const createNozzle = Joi.object({
  branchId: Joi.string().trim().required().messages({
    'any.required': 'Branch ID is required',
    'string.empty': 'Branch ID is required',
  }),
  pumpId: Joi.string().trim().required().messages({
    'any.required': 'Pump ID is required',
    'string.empty': 'Pump ID is required',
  }),
  nozzleNumber: Joi.number().integer().positive().required().messages({
    'any.required': 'Nozzle number is required',
    'number.base': 'Nozzle number must be a number',
    'number.integer': 'Nozzle number must be an integer',
    'number.positive': 'Nozzle number must be positive',
  }),
  fuelType: Joi.string().valid(...fuelTypes).required().messages({
    'any.required': 'Fuel type is required',
    'any.only': 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
  }),
  tankId: Joi.string().trim().required().messages({
    'any.required': 'Tank ID is required',
    'string.empty': 'Tank ID is required',
  }),
  currentReading: Joi.number().min(0).default(0),
  status: Joi.string().valid(...tankStatuses).default('active'),
});

const updateNozzle = Joi.object({
  fuelType: Joi.string().valid(...fuelTypes),
  tankId: Joi.string().trim(),
  status: Joi.string().valid(...tankStatuses),
  currentReading: Joi.number().min(0),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const listNozzlesQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  branchId: Joi.string().optional().allow('', null),
  pumpId: Joi.string().optional().allow('', null),
  fuelType: Joi.string().valid(...fuelTypes).optional().allow('', null),
  status: Joi.string().valid(...tankStatuses).optional().allow('', null),
});

const adjustStock = Joi.object({
  branchId: Joi.string().trim().required().messages({
    'any.required': 'Branch ID is required',
    'string.empty': 'Branch ID is required',
  }),
  fuelType: Joi.string().valid(...fuelTypes).required().messages({
    'any.required': 'Fuel type is required',
    'any.only': 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
  }),
  tankId: Joi.string().trim().required().messages({
    'any.required': 'Tank ID is required',
    'string.empty': 'Tank ID is required',
  }),
  quantity: Joi.number().required().messages({
    'any.required': 'Quantity is required',
    'number.base': 'Quantity must be a number',
  }),
  notes: Joi.string().max(500).optional().allow(null, ''),
});

const stockMovementsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  branchId: Joi.string().optional().allow('', null),
  fuelType: Joi.string().valid(...fuelTypes).optional().allow('', null),
  tankId: Joi.string().optional().allow('', null),
  type: Joi.string().valid('sale', 'purchase', 'adjustment', 'opening', 'transfer').optional().allow('', null),
  startDate: Joi.date().iso().optional().allow('', null),
  endDate: Joi.date().iso().optional().allow('', null),
});

const summaryQuery = Joi.object({
  branchId: Joi.string().optional().allow('', null),
  fuelType: Joi.string().valid(...fuelTypes).optional().allow('', null),
});

const stockQuery = Joi.object({
  branchId: Joi.string().optional().allow('', null),
  fuelType: Joi.string().valid(...fuelTypes).optional().allow('', null),
});

module.exports = {
  createTank,
  updateTank,
  listTanksQuery,
  createPump,
  updatePump,
  listPumpsQuery,
  createNozzle,
  updateNozzle,
  listNozzlesQuery,
  adjustStock,
  stockMovementsQuery,
  summaryQuery,
  stockQuery,
};
