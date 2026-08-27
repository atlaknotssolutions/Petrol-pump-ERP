const mongoose = require('mongoose');

const STATUSES = ['active', 'inactive', 'maintenance'];

const pumpSchema = new mongoose.Schema(
  {
    branchId: {
      type: String,
      required: [true, 'Branch ID is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Pump name is required'],
      trim: true,
      maxlength: [100, 'Pump name cannot exceed 100 characters'],
    },
    pumpNumber: {
      type: Number,
      required: [true, 'Pump number is required'],
      min: [1, 'Pump number must be at least 1'],
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

pumpSchema.index({ branchId: 1, pumpNumber: 1 }, { unique: true });

pumpSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Pump = mongoose.model('Pump', pumpSchema);

module.exports = Pump;
module.exports.STATUSES = STATUSES;
