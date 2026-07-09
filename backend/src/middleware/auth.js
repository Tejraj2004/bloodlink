const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies?.token)
      token = req.cookies.token;

    if (!token) return errorResponse(res, 'Not authenticated. Please log in.', 401);

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.isActive) return errorResponse(res, 'User not found or deactivated.', 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Token expired. Please log in again.', 401);
    return errorResponse(res, 'Invalid token.', 401);
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return errorResponse(res, `Role '${req.user.role}' is not authorized for this action.`, 403);
  next();
};

exports.verifiedOnly = (req, res, next) => {
  if (!req.user.isEmailVerified)
    return errorResponse(res, 'Please verify your email first.', 403);
  next();
};

exports.adminVerifiedOnly = (req, res, next) => {
  if (['hospital', 'bloodbank'].includes(req.user.role) && !req.user.isAdminVerified)
    return errorResponse(res, 'Your account is pending admin verification.', 403);
  next();
};
