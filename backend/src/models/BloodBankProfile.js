const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  rbc:        { type: Number, default: 0 },
  plasma:     { type: Number, default: 0 },
  platelets:  { type: Number, default: 0 },
  wholeBlood: { type: Number, default: 0 },
  lastUpdated:{ type: Date, default: Date.now },
}, { _id: false });

const bloodBankProfileSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bankName:      { type: String, required: true },
  licenseNo:     { type: String, required: true, unique: true },
  nbtcAccredited:{ type: Boolean, default: false },
  address:       { type: String, required: true },
  city:          { type: String, required: true },
  state:         { type: String, default: 'Odisha' },
  pincode:       { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  contactPhone:  { type: String },
  emergencyPhone:{ type: String },
  website:       { type: String },
  licenseDocument: { type: String },
  isVerified:    { type: Boolean, default: false },
  inventory:     [inventoryItemSchema],

  // Thresholds for alerts
  lowStockThreshold: { type: Number, default: 5 },
  criticalThreshold: { type: Number, default: 2 },
}, { timestamps: true });

bloodBankProfileSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('BloodBankProfile', bloodBankProfileSchema);
