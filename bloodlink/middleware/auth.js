const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.redirect('/dashboard');
};

const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect('/dashboard');
};

module.exports = { ensureAuth, ensureAdmin, ensureGuest };
