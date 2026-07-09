let admin = null;

const getAdmin = () => {
  if (!admin) {
    try {
      admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID,
            privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
      }
    } catch (e) {
      console.warn('Firebase not configured:', e.message);
      admin = null;
    }
  }
  return admin;
};

exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const a = getAdmin();
  if (!a || !fcmToken) return { success: false, error: 'FCM not configured or no token' };
  try {
    const response = await a.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high', notification: { channelId: 'bloodlink_alerts', color: '#dc2626' } },
      apns: { payload: { aps: { badge: 1, sound: 'default' } } },
    });
    return { success: true, response };
  } catch (err) {
    console.error('FCM error:', err.message);
    return { success: false, error: err.message };
  }
};

exports.sendMulticastNotification = async (tokens, title, body, data = {}) => {
  const a = getAdmin();
  if (!a || !tokens?.length) return { success: false };
  try {
    const response = await a.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
    console.log(`🔔 Push sent: ${response.successCount} success, ${response.failureCount} failed`);
    return { success: true, successCount: response.successCount };
  } catch (err) {
    console.error('FCM multicast error:', err.message);
    return { success: false, error: err.message };
  }
};
