const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryId:  { type: String, required: true, unique: true },
  request:     { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  fromBank:    { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile', required: true },
  toHospital:  { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalProfile', required: true },
  units:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodUnit' }],
  driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName:  { type: String },
  vehicleNo:   { type: String },
  status: {
    type: String,
    enum: ['Assigned','Picked Up','In Transit','Delivered','Failed'],
    default: 'Assigned'
  },
  currentLocation: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  estimatedArrival: { type: Date },
  pickedUpAt:       { type: Date },
  deliveredAt:      { type: Date },
  notes:            { type: String },
}, { timestamps: true });

deliverySchema.index({ currentLocation: '2dsphere' });
module.exports = mongoose.model('Delivery', deliverySchema);
