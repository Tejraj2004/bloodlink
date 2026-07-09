const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodBankProfile = require('../models/BloodBankProfile');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, getOTPExpiry, isOTPValid } = require('../utils/otp');
const { sendOTP, sendWelcomeEmail: sendWelcome } = require('../services/notificationService');
const { sendWelcomeEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const { successResponse, errorResponse } = require('../utils/response');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, ...profileData } = req.body;

    const validRoles = ['donor', 'patient', 'hospital', 'bloodbank', 'ambulance'];
    if (!validRoles.includes(role))
      return errorResponse(res, 'Invalid role selected.', 400);

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already registered.', 409);

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpire = getOTPExpiry(10);

    const user = await User.create({
      name, email, phone, password, role,
      otp, otpExpire,
      authProvider: 'local',
    });

    // Create role-specific profile
    await createRoleProfile(user._id, role, profileData);

    // Send OTP
    await sendOTP(user, otp);

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      requiresVerification: true,
    }, 'Registration successful. Please verify your email/phone.', 201);
  } catch (err) {
    console.error('Register error:', err);
    return errorResponse(res, err.message, 500);
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user) return errorResponse(res, 'User not found.', 404);

    if (!isOTPValid(user.otp, user.otpExpire, otp))
      return errorResponse(res, 'Invalid or expired OTP.', 400);

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user.email, user.name, user.role);

    return successResponse(res, { user: user.toJSON() }, 'Email verified successfully.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (user.isEmailVerified) return errorResponse(res, 'Email already verified.', 400);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = getOTPExpiry(10);
    await user.save({ validateBeforeSave: false });

    await sendOTP(user, otp);
    return successResponse(res, {}, 'OTP resent successfully.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password required.', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user) return errorResponse(res, 'Invalid credentials.', 401);
    if (user.authProvider === 'google')
      return errorResponse(res, 'This account uses Google Sign-In.', 400);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials.', 401);

    if (!user.isActive) return errorResponse(res, 'Account deactivated. Contact support.', 403);
    if (role && user.role !== role)
      return errorResponse(res, `This account is registered as ${user.role}, not ${role}.`, 403);

    user.lastLogin = new Date();
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);

    return successResponse(res, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }, 'Login successful.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return errorResponse(res, 'Google ID token required.', 400);

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Existing user — update googleId if missing
      if (!user.googleId) { user.googleId = googleId; user.authProvider = 'google'; }
      if (picture && !user.avatar) user.avatar = picture;
      if (role && user.role !== role)
        return errorResponse(res, `Account already registered as ${user.role}.`, 403);
    } else {
      // New user
      const validRoles = ['donor', 'patient', 'hospital', 'bloodbank', 'ambulance'];
      if (!role || !validRoles.includes(role))
        return errorResponse(res, 'Role is required for new Google sign-ups.', 400);

      user = await User.create({
        name, email, googleId,
        authProvider: 'google',
        avatar: picture || '',
        role,
        isEmailVerified: true, // Google accounts are pre-verified
      });
      await createRoleProfile(user._id, role, {});
      await sendWelcomeEmail(email, name, role);
    }

    user.lastLogin = new Date();
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);

    return successResponse(res, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      isNewUser: !user.createdAt,
    }, 'Google authentication successful.');
  } catch (err) {
    console.error('Google auth error:', err);
    return errorResponse(res, 'Google authentication failed.', 401);
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 'Refresh token required.', 400);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return errorResponse(res, 'Invalid refresh token.', 401);

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed.');
  } catch (err) {
    return errorResponse(res, 'Invalid or expired refresh token.', 401);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
    return successResponse(res, {}, 'Logged out successfully.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, { user }, 'User fetched.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user) return errorResponse(res, 'No account with that email.', 404);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = getOTPExpiry(10);
    await user.save({ validateBeforeSave: false });

    await sendOTP(user, otp);
    return successResponse(res, {}, 'Password reset OTP sent to your email/phone.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpire +password');
    if (!user) return errorResponse(res, 'User not found.', 404);

    if (!isOTPValid(user.otp, user.otpExpire, otp))
      return errorResponse(res, 'Invalid or expired OTP.', 400);

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return successResponse(res, {}, 'Password reset successful.');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── HELPER: Create role-specific profile ─────────────────────────────────────
const createRoleProfile = async (userId, role, data) => {
  switch (role) {
    case 'donor':
      await DonorProfile.create({
        user: userId,
        bloodGroup: data.bloodGroup || 'O+',
        dateOfBirth: data.dateOfBirth || new Date('1995-01-01'),
        gender: data.gender || 'Male',
        city: data.city || '',
        state: data.state || 'Odisha',
      });
      break;
    case 'hospital':
      if (data.hospitalName) {
        await HospitalProfile.create({
          user: userId,
          hospitalName: data.hospitalName,
          registrationNo: data.registrationNo || `REG-${Date.now()}`,
          type: data.type || 'Private',
          address: data.address || '',
          city: data.city || '',
        });
      }
      break;
    case 'bloodbank':
      if (data.bankName) {
        await BloodBankProfile.create({
          user: userId,
          bankName: data.bankName,
          licenseNo: data.licenseNo || `LIC-${Date.now()}`,
          address: data.address || '',
          city: data.city || '',
          inventory: ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => ({
            bloodGroup: g, rbc: 0, plasma: 0, platelets: 0, wholeBlood: 0,
          })),
        });
      }
      break;
    default:
      break;
  }
};
