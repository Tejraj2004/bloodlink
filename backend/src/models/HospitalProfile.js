const mongoose = require('mongoose');

const hospitalProfileSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hospitalName:   { type: String, required: true },
  registrationNo: { type: String, required: true, unique: true },
  type:           { type: String, enum: ['Government','Private','Trust','NGO'], required: true },
  beds:           { type: Number, default: 0 },
  address:        { type: String, required: true },
  city:           { type: String, required: true },
  state:          { type: String, default: 'Odisha' },
  pincode:        { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  emergencyContact: { type: String },
  website:          { type: String },
  licenseDocument:  { type: String }, // Cloudinary URL
  isVerified:       { type: Boolean, default: false },
  verifiedAt:       { type: Date },
}, { timestamps: true });

hospitalProfileSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('HospitalProfile', hospitalProfileSchema);
