const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  bloodGroupNeeded: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  unitsNeeded: { type: Number, default: 1 },
  hospitalName: { type: String, required: true },
  hospitalAddress: { type: String, required: true },
  wardRoom: { type: String },
  attendingDoctor: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  city: { type: String },
  contactPhone: { type: String, required: true },
  contactPerson: { type: String },
  notes: { type: String },
  urgency: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  status: { type: String, enum: ['pending','matched','fulfilled','expired'], default: 'pending' },
  matches: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile' },
    status: { type: String, enum: ['suggested','accepted','completed'], default: 'suggested' },
    compatibilityReason: { type: String },
    aiScore: { type: Number },
    notifiedAt: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
