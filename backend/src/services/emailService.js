const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'BloodLink'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to, subject, html, text,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
};

exports.sendOTPEmail = async (to, name, otp) =>
  sendMail({
    to, subject: 'BloodLink — Your OTP Verification Code',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#dc2626;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">🩸 BloodLink</h1>
        <p style="color:#fecaca;margin:4px 0 0">Smart Blood Management Platform</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin:0 0 16px">Hello, ${name}!</h2>
        <p style="color:#475569;line-height:1.6">Your OTP verification code is:</p>
        <div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:700;color:#dc2626;letter-spacing:8px">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;color:#94a3b8;font-size:12px">
        © ${new Date().getFullYear()} BloodLink. Saving lives, one drop at a time.
      </div>
    </div>`,
  });

exports.sendWelcomeEmail = async (to, name, role) =>
  sendMail({
    to, subject: 'Welcome to BloodLink 🩸',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
      <div style="background:#dc2626;padding:24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0">🩸 Welcome to BloodLink</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#1e293b">Hello ${name},</h2>
        <p style="color:#475569;line-height:1.6">Your <strong>${role}</strong> account has been created successfully. You are now part of India's most advanced blood management network.</p>
        <p style="color:#475569">Together, we save lives. 💪</p>
      </div>
    </div>`,
  });

exports.sendEmergencyAlert = async (to, name, bloodGroup, hospital) =>
  sendMail({
    to, subject: `🚨 URGENT: ${bloodGroup} Blood Needed — BloodLink`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
      <div style="background:#dc2626;padding:20px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">🚨 Emergency Blood Request</h1>
      </div>
      <div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#dc2626">Dear ${name},</h2>
        <p style="color:#1e293b;font-size:16px"><strong>${bloodGroup} blood is urgently needed</strong> at ${hospital}.</p>
        <p style="color:#475569">As a registered ${bloodGroup} donor, you can save a life today. Please log in to BloodLink and schedule your donation immediately.</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:4px">
          <strong style="color:#dc2626">This is a critical emergency.</strong><br>
          <span style="color:#475569">Your blood could mean the difference between life and death.</span>
        </div>
      </div>
    </div>`,
  });
