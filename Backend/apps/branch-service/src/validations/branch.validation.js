const Joi = require('joi');

const addressSchema = Joi.object({
  line1: Joi.string().trim().required(),
  line2: Joi.string().trim().allow('', null),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  country: Joi.string().trim().default('India'),
});

const geoLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
});

const operatingHoursSchema = Joi.object({
  opensAt: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closesAt: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  is24x7: Joi.boolean(),
});

const createBranch = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  code: Joi.string().trim().alphanum().min(2).max(20).required(),
  address: addressSchema.required(),
  geoLocation: geoLocationSchema,
  phone: Joi.string()
    .trim()
    .pattern(/^[+]?[\d\s-]{7,15}$/)
    .required(),
  email: Joi.string().trim().lowercase().email(),
  gstNumber: Joi.string().trim().uppercase(),
  licenseNumber: Joi.string().trim(),
  operatingHours: operatingHoursSchema,
  fuelTypes: Joi.array().items(Joi.string().trim()),
  managerId: Joi.string().trim().allow(null),
  metadata: Joi.object(),
});

const updateBranch = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  address: addressSchema,
  geoLocation: geoLocationSchema,
  phone: Joi.string()
    .trim()
    .pattern(/^[+]?[\d\s-]{7,15}$/),
  email: Joi.string().trim().lowercase().email(),
  gstNumber: Joi.string().trim().uppercase(),
  licenseNumber: Joi.string().trim(),
  operatingHours: operatingHoursSchema,
  fuelTypes: Joi.array().items(Joi.string().trim()),
  metadata: Joi.object(),
}).min(1);

const assignManager = Joi.object({
  managerId: Joi.string().trim().required(),
});

const updateStatus = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'under_maintenance').required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('active', 'inactive', 'under_maintenance').allow('', null).optional(),
  city: Joi.string().trim().allow('', null).optional(),
  state: Joi.string().trim().allow('', null).optional(),
  search: Joi.string().trim().allow('', null).optional(), // matches name or code
});

module.exports = {
  createBranch,
  updateBranch,
  assignManager,
  updateStatus,
  listQuery,
};
