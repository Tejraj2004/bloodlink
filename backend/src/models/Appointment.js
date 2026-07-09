const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  donor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile', required: true },
  camp:      { type: mongoose.Schema.Types.ObjectId, ref: 'DonationCamp' },

  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true }, // e.g. "10:30"
  status: {
    type: String,
    enum: ['Scheduled','Confirmed','Completed','Cancelled','No-Show'],
    default: 'Scheduled'
  },
  notes:   { type: String },
  bloodUnit:{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodUnit' }, // filled after donation
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
