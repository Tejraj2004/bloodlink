const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup:   { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  dateOfBirth:  { type: Date, required: true },
  gender:       { type: String, enum: ['Male','Female','Other'], required: true },
  weight:       { type: Number }, // kg
  address:      { type: String },
  city:         { type: String },
  state:        { type: String, default: 'Odisha' },
  pincode:      { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },

  // Health
  medicalConditions: [String],
  medications:       [String],
  isEligible:        { type: Boolean, default: true },
  eligibilityNote:   { type: String, default: '' },

  // Donation stats
  totalDonations:    { type: Number, default: 0 },
  lastDonationDate:  { type: Date },
  nextEligibleDate:  { type: Date },

  // Gamification
  donorScore:  { type: Number, default: 0 },
  badges:      [{ name: String, earnedAt: Date }],

  // Notifications preference
  notifyBySMS:      { type: Boolean, default: true },
  notifyByEmail:    { type: Boolean, default: true },
  notifyByWhatsApp: { type: Boolean, default: false },
  notifyByPush:     { type: Boolean, default: true },

  responseRate: { type: Number, default: 100 }, // %
}, { timestamps: true });

donorProfileSchema.index({ location: '2dsphere' });
donorProfileSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
