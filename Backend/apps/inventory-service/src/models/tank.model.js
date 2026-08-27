const mongoose = require('mongoose');

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];
const STATUSES = ['active', 'inactive', 'maintenance'];

const tankSchema = new mongoose.Schema(
  {
    branchId: {
      type: String,
      required: [true, 'Branch ID is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tank name is required'],
      trim: true,
      maxlength: [100, 'Tank name cannot exceed 100 characters'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: FUEL_TYPES,
        message: 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0.01, 'Capacity must be positive'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minAlertLevel: {
      type: Number,
      min: [0, 'Alert level cannot be negative'],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be one of: active, inactive, maintenance',
      },
      default: 'active',
      index: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tankSchema.index({ branchId: 1, fuelType: 1 }, { unique: true });

tankSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Tank = mongoose.model('Tank', tankSchema);

module.exports = Tank;
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.STATUSES = STATUSES;
