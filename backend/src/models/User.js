const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, default: '' },
  password:     { type: String, select: false },
  role:         { type: String, enum: ['donor','patient','hospital','bloodbank','ambulance','admin'], required: true },
  avatar:       { type: String, default: '' },

  // OAuth
  googleId:     { type: String, default: '' },
  authProvider: { type: String, enum: ['local','google'], default: 'local' },

  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isAdminVerified: { type: Boolean, default: false }, // for hospital/bloodbank

  // OTP
  otp:          { type: String, select: false },
  otpExpire:    { type: Date,   select: false },

  // Refresh token
  refreshToken: { type: String, select: false },

  // FCM push token
  fcmToken:     { type: String, default: '' },

  isActive:     { type: Boolean, default: true },
  lastLogin:    { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpire;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
