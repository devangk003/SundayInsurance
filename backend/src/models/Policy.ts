import mongoose, { Schema } from 'mongoose';

const CoverageSchema = new Schema({
  bodilyInjury: { type: Number, required: true },
  propertyDamage: { type: Number, required: true },
  collision: { type: Number },
  comprehensive: { type: Number },
  uninsuredMotorist: { type: Number }
}, { _id: false });

const PolicySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['liability', 'comprehensive', 'collision', 'full-coverage']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  premium: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    required: true,
    min: 0
  },
  coverage: {
    type: CoverageSchema,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date
  },
  documents: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PolicySchema.index({ userId: 1, status: 1 });
PolicySchema.index({ carId: 1 });
PolicySchema.index({ policyNumber: 1 });
PolicySchema.index({ endDate: 1 }); // For renewal reminders

// Virtual for policy status check
PolicySchema.virtual('isExpiringSoon').get(function() {
  const daysUntilExpiry = Math.ceil((this.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

PolicySchema.virtual('isExpired').get(function() {
  return this.endDate < new Date();
});

export const Policy = mongoose.model('Policy', PolicySchema);
