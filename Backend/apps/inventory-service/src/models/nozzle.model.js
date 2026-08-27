const mongoose = require('mongoose');

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];
const STATUSES = ['active', 'inactive', 'maintenance'];

const nozzleSchema = new mongoose.Schema(
  {
    branchId: {
      type: String,
      required: [true, 'Branch ID is required'],
      trim: true,
      index: true,
    },
    pumpId: {
      type: String,
      required: [true, 'Pump ID is required'],
      trim: true,
      index: true,
    },
    nozzleNumber: {
      type: Number,
      required: [true, 'Nozzle number is required'],
      min: [1, 'Nozzle number must be at least 1'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: FUEL_TYPES,
        message: 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
      },
    },
    tankId: {
      type: String,
      required: [true, 'Tank ID is required'],
      trim: true,
      index: true,
    },
    currentReading: {
      type: Number,
      default: 0,
      min: [0, 'Reading cannot be negative'],
    },
    lastClosingReading: {
      type: Number,
      default: 0,
      min: [0, 'Reading cannot be negative'],
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

nozzleSchema.index({ branchId: 1, pumpId: 1, nozzleNumber: 1 }, { unique: true });

nozzleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Nozzle = mongoose.model('Nozzle', nozzleSchema);

module.exports = Nozzle;
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.STATUSES = STATUSES;
