let twilioClient = null;

const getClient = () => {
  if (!twilioClient) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (e) {
      console.warn('Twilio not configured:', e.message);
    }
  }
  return twilioClient;
};

const sendSMS = async (to, body) => {
  const client = getClient();
  if (!client) return { success: false, error: 'Twilio not configured' };
  try {
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith('+') ? to : `+91${to}`,
    });
    console.log(`📱 SMS sent to ${to}: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('SMS error:', err.message);
    return { success: false, error: err.message };
  }
};

exports.sendOTPSMS = (phone, otp) =>
  sendSMS(phone, `BloodLink OTP: ${otp}\nValid for 10 minutes. Do not share. -BloodLink`);

exports.sendEmergencySMS = (phone, bloodGroup, hospital) =>
  sendSMS(phone, `URGENT: ${bloodGroup} blood needed at ${hospital}. Log in to BloodLink to respond. This is a critical request.`);

exports.sendAppointmentReminder = (phone, date, bankName) =>
  sendSMS(phone, `BloodLink Reminder: Your donation appointment at ${bankName} is on ${date}. Thank you for saving lives!`);

exports.sendDeliveryUpdate = (phone, deliveryId, status, eta) =>
  sendSMS(phone, `BloodLink: Delivery ${deliveryId} is now ${status}.${eta ? ` ETA: ${eta} min.` : ''}`);
