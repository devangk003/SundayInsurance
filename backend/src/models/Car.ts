import mongoose, { Schema } from 'mongoose';

const CarSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 2
  },
  vin: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
      },
      message: 'Invalid VIN format'
    }
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    min: 0
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual']
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid']
  },
  photos: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CarSchema.index({ userId: 1, isActive: 1 });
CarSchema.index({ make: 1, model: 1, year: 1 });

// Virtual for full name
CarSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

export const Car = mongoose.model('Car', CarSchema);
