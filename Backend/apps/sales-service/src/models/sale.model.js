const mongoose = require('mongoose');

const { Schema } = mongoose;

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];
const PAYMENT_METHODS = ['cash', 'upi', 'card', 'credit', 'other'];

const saleSchema = new Schema(
  {
    branchId: {
      type: String,
      required: [true, 'Branch ID is required'],
      trim: true,
      index: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: FUEL_TYPES,
        message: 'Fuel type must be one of: {VALUE}',
      },
      index: true,
    },
    nozzleId: {
      type: String,
      required: [true, 'Nozzle ID is required'],
      trim: true,
    },
    openingReading: {
      type: Number,
      required: [true, 'Opening reading is required'],
      min: [0, 'Opening reading cannot be negative'],
    },
    closingReading: {
      type: Number,
      required: [true, 'Closing reading is required'],
      min: [0, 'Closing reading cannot be negative'],
    },
    quantitySold: {
      type: Number,
      required: true,
      min: [0, 'Quantity sold cannot be negative'],
    },
    fuelRatePerLitre: {
      type: Number,
      required: [true, 'Fuel rate per litre is required'],
      min: [0, 'Fuel rate cannot be negative'],
    },
    fuelAmount: {
      type: Number,
      required: true,
      min: [0, 'Fuel amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: PAYMENT_METHODS,
        message: 'Payment method must be one of: {VALUE}',
      },
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    paymentReference: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    operatorId: {
      type: String,
      required: [true, 'Operator ID is required'],
      trim: true,
      index: true,
    },
    operatorName: {
      type: String,
      trim: true,
      default: null,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Created by user ID is required'],
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
saleSchema.index({ branchId: 1, saleDate: -1 });
saleSchema.index({ nozzleId: 1, branchId: 1, saleDate: -1 });

// Unique compound index: prevent exact duplicate (same branch, nozzle, closing reading)
saleSchema.index(
  { branchId: 1, nozzleId: 1, closingReading: 1 },
  { unique: true }
);

saleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
