const { totp } = require('otplib');
const crypto = require('crypto');

totp.options = { step: 600, digits: 6 }; // 10 min window

exports.generateOTP = () => {
  // Simple 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.getOTPExpiry = (minutes = 10) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

exports.isOTPValid = (storedOTP, storedExpiry, enteredOTP) => {
  if (!storedOTP || !storedExpiry) return false;
  if (new Date() > new Date(storedExpiry)) return false;
  return storedOTP === enteredOTP;
};
