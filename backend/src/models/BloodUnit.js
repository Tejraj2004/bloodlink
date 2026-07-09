const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  unitId:      { type: String, required: true, unique: true },
  bloodBank:   { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile', required: true },
  donor:       { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile' },
  donorName:   { type: String },

  bloodGroup:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  component:   { type: String, enum: ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate'], required: true },
  volume:      { type: Number }, // ml
  collectedAt: { type: Date, default: Date.now },
  expiresAt:   { type: Date, required: true },

  // TTI Screening
  tti: {
    hiv:      { type: String, enum: ['Pending','Clear','Reactive'], default: 'Pending' },
    hbv:      { type: String, enum: ['Pending','Clear','Reactive'], default: 'Pending' },
    hcv:      { type: String, enum: ['Pending','Clear','Reactive'], default: 'Pending' },
    malaria:  { type: String, enum: ['Pending','Clear','Reactive'], default: 'Pending' },
    syphilis: { type: String, enum: ['Pending','Clear','Reactive'], default: 'Pending' },
    testedAt: { type: Date },
    testedBy: { type: String },
  },

  // Status lifecycle
  status: {
    type: String,
    enum: ['Collected','Testing','Approved','Rejected','Reserved','Issued','Expired','Discarded'],
    default: 'Collected'
  },

  // Allocation
  reservedFor:   { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  issuedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalProfile' },
  issuedAt:      { type: Date },

  storageLocation: { type: String },
  notes:           { type: String },
}, { timestamps: true });

bloodUnitSchema.index({ bloodGroup: 1, component: 1, status: 1 });
bloodUnitSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
