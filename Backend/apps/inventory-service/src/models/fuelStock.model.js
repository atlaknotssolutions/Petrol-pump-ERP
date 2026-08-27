const mongoose = require('mongoose');

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];

const fuelStockSchema = new mongoose.Schema(
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
        message: 'Fuel type must be one of: Petrol, Diesel, CNG, EV',
      },
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

fuelStockSchema.index({ branchId: 1, fuelType: 1 }, { unique: true });

fuelStockSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const FuelStock = mongoose.model('FuelStock', fuelStockSchema);

module.exports = FuelStock;
module.exports.FUEL_TYPES = FUEL_TYPES;
