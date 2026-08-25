const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUSES = ['active', 'inactive', 'under_maintenance'];

const addressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
  },
  { _id: false }
);

const geoLocationSchema = new Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const operatingHoursSchema = new Schema(
  {
    opensAt: { type: String, default: '06:00' }, // 24h "HH:mm"
    closesAt: { type: String, default: '22:00' },
    is24x7: { type: Boolean, default: false },
  },
  { _id: false }
);

const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    geoLocation: geoLocationSchema,
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    operatingHours: {
      type: operatingHoursSchema,
      default: () => ({}),
    },
    // References a User._id from auth-service. Not populated (different DB/service) —
    // resolved by the gateway/client calling auth-service's /users endpoint if needed.
    managerId: {
      type: String,
      default: null,
      index: true,
    },
    fuelTypes: {
      type: [String],
      default: ['Petrol', 'Diesel'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
      index: true,
    },
    // Free-form metadata for future extensibility without a migration
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: String, // userId from auth-service (via X-User-Id header)
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

branchSchema.index({ 'address.city': 1, 'address.state': 1 });

branchSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
module.exports.STATUSES = STATUSES;
