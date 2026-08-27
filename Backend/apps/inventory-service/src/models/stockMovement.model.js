const mongoose = require('mongoose');

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'EV'];
const MOVEMENT_TYPES = ['sale', 'purchase', 'adjustment', 'opening', 'transfer'];
const REFERENCE_TYPES = ['sale', 'purchase', 'manual', 'system'];

const stockMovementSchema = new mongoose.Schema(
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
    tankId: {
      type: String,
      required: [true, 'Tank ID is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Movement type is required'],
      enum: {
        values: MOVEMENT_TYPES,
        message: 'Movement type must be one of: sale, purchase, adjustment, opening, transfer',
      },
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    referenceId: {
      type: String,
      default: null,
      index: true,
    },
    referenceType: {
      type: String,
      enum: {
        values: REFERENCE_TYPES,
        message: 'Reference type must be one of: sale, purchase, manual, system',
      },
      default: null,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
    performedBy: {
      type: String,
      required: [true, 'Performed by is required'],
    },
    runningBalance: {
      type: Number,
      required: [true, 'Running balance is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

stockMovementSchema.index({ branchId: 1, createdAt: -1 });
stockMovementSchema.index({ tankId: 1, createdAt: -1 });

stockMovementSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.MOVEMENT_TYPES = MOVEMENT_TYPES;
