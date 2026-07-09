const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendOTPEmail, sendWelcomeEmail, sendEmergencyAlert } = require('./emailService');
const { sendOTPSMS, sendEmergencySMS } = require('./smsService');
const { sendPushNotification, sendMulticastNotification } = require('./pushService');

// Save notification to DB + emit via socket
exports.createNotification = async (recipientId, type, title, message, data = {}, io = null) => {
  try {
    const notif = await Notification.create({ recipient: recipientId, type, title, message, data });
    if (io) io.to(`user_${recipientId}`).emit('notification', notif);
    return notif;
  } catch (err) {
    console.error('Notification DB error:', err.message);
  }
};

// Send OTP via email + SMS
exports.sendOTP = async (user, otp) => {
  const promises = [];
  if (user.email) promises.push(sendOTPEmail(user.email, user.name, otp));
  if (user.phone) promises.push(sendOTPSMS(user.phone, otp));
  await Promise.allSettled(promises);
};

// Emergency donor activation
exports.activateDonors = async (donors, bloodGroup, hospitalName, io = null) => {
  const emailPromises = donors
    .filter(d => d.user?.email)
    .map(d => sendEmergencyAlert(d.user.email, d.user.name, bloodGroup, hospitalName));

  const smsPromises = donors
    .filter(d => d.user?.phone && d.notifyBySMS)
    .map(d => sendEmergencySMS(d.user.phone, bloodGroup, hospitalName));

  const fcmTokens = donors.filter(d => d.user?.fcmToken).map(d => d.user.fcmToken);
  const pushPromise = fcmTokens.length > 0
    ? sendMulticastNotification(fcmTokens, `🚨 Emergency: ${bloodGroup} Needed`, `Urgently needed at ${hospitalName}`)
    : Promise.resolve();

  const dbPromises = donors.map(d =>
    exports.createNotification(d.user._id, 'emergency',
      `🚨 Emergency: ${bloodGroup} Blood Needed`,
      `Urgently required at ${hospitalName}. Please donate immediately.`,
      { bloodGroup, hospital: hospitalName }, io
    )
  );

  await Promise.allSettled([...emailPromises, ...smsPromises, pushPromise, ...dbPromises]);
  console.log(`🚨 Emergency activation sent to ${donors.length} donors`);
};
