const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['emergency','shortage','appointment','delivery','campaign','eligibility','system'], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  data:       { type: mongoose.Schema.Types.Mixed, default: {} },
  read:       { type: Boolean, default: false },
  readAt:     { type: Date },
  channels:   [{ type: String, enum: ['push','email','sms','whatsapp'] }],
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1 });
module.exports = mongoose.model('Notification', notificationSchema);
