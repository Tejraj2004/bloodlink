const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank:   { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile' },
  name:        { type: String, required: true },
  venue:       { type: String, required: true },
  address:     { type: String, required: true },
  city:        { type: String, required: true },
  date:        { type: Date, required: true },
  startTime:   { type: String, default: '09:00' },
  endTime:     { type: String, default: '17:00' },
  targetDonors:{ type: Number, default: 100 },
  registeredDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  status:      { type: String, enum: ['Upcoming','Ongoing','Completed','Cancelled'], default: 'Upcoming' },
  description: { type: String },
  banner:      { type: String },
}, { timestamps: true });

campSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('DonationCamp', campSchema);
