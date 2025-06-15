import mongoose, { Schema } from 'mongoose';

const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String }
}, { _id: false });

const PreferencesSchema = new Schema({
  notifications: { type: Boolean, default: true },
  newsletter: { type: Boolean, default: false },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }
}, { _id: false });

const UserSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  address: AddressSchema,
  preferences: {
    type: PreferencesSchema,
    default: () => ({})
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
UserSchema.index({ email: 1, uid: 1 });
UserSchema.index({ isActive: 1 });

export const User = mongoose.model('User', UserSchema);
