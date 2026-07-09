const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requestId:    { type: String, required: true, unique: true },
  requestedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterRole:{ type: String, enum: ['patient','hospital','admin'] },

  patientName:  { type: String, required: true },
  patientAge:   { type: Number },
  patientGender:{ type: String },
  diagnosis:    { type: String },

  hospital:     { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalProfile' },
  hospitalName: { type: String },

  bloodGroup:   { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  component:    { type: String, enum: ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate'], required: true },
  units:        { type: Number, required: true, min: 1 },

  urgency:      { type: String, enum: ['Normal','Urgent','Critical'], default: 'Normal' },
  requiredBy:   { type: Date },

  status: {
    type: String,
    enum: ['Pending','Processing','Allocated','In Transit','Fulfilled','Cancelled'],
    default: 'Pending'
  },

  assignedBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile' },
  assignedUnits:[{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodUnit' }],

  medicalDocuments: [String], // Cloudinary URLs
  notes:            { type: String },

  // Tracking
  fulfilledAt:  { type: Date },
  cancelledAt:  { type: Date },
  cancelReason: { type: String },

  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
}, { timestamps: true });

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, urgency: 1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
