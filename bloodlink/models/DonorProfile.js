const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male','Female','Other'], required: true },
  weight: { type: Number, required: true },
  lastDonatedAt: { type: Date },
  medicalConditions: { type: [String], default: [] },
  onMedication: { type: Boolean, default: false },
  city: { type: String, required: true },
  pincode: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  isAvailable: { type: Boolean, default: true },
  contactMethod: { type: String, enum: ['call','sms','whatsapp'], default: 'call' },
  phone: { type: String, required: true },
  isEligible: { type: Boolean, default: true },
  livesSaved: { type: Number, default: 0 },
  donationHistory: [{
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
    date: { type: Date },
    patientName: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
