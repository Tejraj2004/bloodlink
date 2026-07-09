const router   = require('express').Router();
const { protect, authorize } = require('../middleware/auth');

const donorCtrl  = require('../controllers/donorController');
const requestCtrl= require('../controllers/requestController');
const bbCtrl     = require('../controllers/bloodBankController');
const hospCtrl   = require('../controllers/hospitalController');
const delivCtrl  = require('../controllers/deliveryController');
const adminCtrl  = require('../controllers/adminController');
const campCtrl   = require('../controllers/campController');
const notifCtrl  = require('../controllers/notificationController');

// ── DONOR ──────────────────────────────────────────────────────────────
router.get('/donors/profile',       protect, authorize('donor'),           donorCtrl.getProfile);
router.put('/donors/profile',       protect, authorize('donor'),           donorCtrl.updateProfile);
router.get('/donors/eligibility',   protect, authorize('donor'),           donorCtrl.checkEligibility);
router.get('/donors/history',       protect, authorize('donor'),           donorCtrl.getDonationHistory);
router.get('/donors/appointments',  protect, authorize('donor'),           donorCtrl.getAppointments);
router.post('/donors/appointments', protect, authorize('donor'),           donorCtrl.bookAppointment);
router.get('/donors/stats',         protect, authorize('donor'),           donorCtrl.getStats);
router.get('/donors/nearby-banks',  protect,                               donorCtrl.getNearbyBanks);
router.get('/donors',               protect, authorize('admin','bloodbank'),donorCtrl.listDonors);

// ── BLOOD REQUESTS ─────────────────────────────────────────────────────
router.post('/requests',                    protect,                              requestCtrl.createRequest);
router.get('/requests',                     protect,                              requestCtrl.listRequests);
router.get('/requests/search-inventory',                                          requestCtrl.searchInventory);
router.get('/requests/:id',                 protect,                              requestCtrl.getRequest);
router.put('/requests/:id/status',          protect, authorize('admin','bloodbank','hospital'), requestCtrl.updateStatus);
router.delete('/requests/:id',              protect,                              requestCtrl.cancelRequest);

// ── BLOOD BANK ─────────────────────────────────────────────────────────
router.get('/bloodbank/profile',            protect, authorize('bloodbank'),      bbCtrl.getProfile);
router.put('/bloodbank/profile',            protect, authorize('bloodbank'),      bbCtrl.updateProfile);
router.get('/bloodbank/inventory',          protect, authorize('bloodbank','admin','hospital'), bbCtrl.getInventory);
router.post('/bloodbank/units',             protect, authorize('bloodbank'),      bbCtrl.recordDonation);
router.get('/bloodbank/units',              protect, authorize('bloodbank','admin'), bbCtrl.listUnits);
router.put('/bloodbank/units/:unitId/tti',  protect, authorize('bloodbank'),      bbCtrl.updateTTI);
router.post('/bloodbank/issue',             protect, authorize('bloodbank'),      bbCtrl.issueUnits);
router.get('/bloodbank/appointments',       protect, authorize('bloodbank'),      bbCtrl.getAppointments);
router.get('/bloodbank/dashboard',          protect, authorize('bloodbank'),      bbCtrl.getDashboardStats);
router.get('/bloodbank/list',                                                      bbCtrl.listBanks);

// ── HOSPITAL ───────────────────────────────────────────────────────────
router.get('/hospital/profile',             protect, authorize('hospital'),       hospCtrl.getProfile);
router.put('/hospital/profile',             protect, authorize('hospital'),       hospCtrl.updateProfile);
router.get('/hospital/dashboard',           protect, authorize('hospital'),       hospCtrl.getDashboardStats);
router.get('/hospital/list',                                                       hospCtrl.listHospitals);

// ── DELIVERIES ─────────────────────────────────────────────────────────
router.post('/deliveries',                  protect, authorize('admin','bloodbank'), delivCtrl.createDelivery);
router.get('/deliveries',                   protect,                                 delivCtrl.listDeliveries);
router.get('/deliveries/:deliveryId',       protect,                                 delivCtrl.getDelivery);
router.put('/deliveries/:deliveryId/status',protect,                                 delivCtrl.updateDeliveryStatus);
router.put('/deliveries/:deliveryId/location',protect, authorize('ambulance'),       delivCtrl.updateLocation);

// ── CAMPS ──────────────────────────────────────────────────────────────
router.post('/camps',                       protect, authorize('admin','bloodbank'), campCtrl.createCamp);
router.get('/camps',                                                                  campCtrl.listCamps);
router.get('/camps/:id',                                                              campCtrl.getCamp);
router.post('/camps/:id/register',          protect, authorize('donor'),             campCtrl.registerForCamp);

// ── ADMIN ──────────────────────────────────────────────────────────────
router.get('/admin/dashboard',              protect, authorize('admin'), adminCtrl.getDashboardStats);
router.get('/admin/analytics',              protect, authorize('admin'), adminCtrl.getAnalytics);
router.get('/admin/users',                  protect, authorize('admin'), adminCtrl.listUsers);
router.put('/admin/users/:id/toggle',       protect, authorize('admin'), adminCtrl.toggleUserStatus);
router.get('/admin/verifications',          protect, authorize('admin'), adminCtrl.getPendingVerifications);
router.post('/admin/verify',                protect, authorize('admin'), adminCtrl.verifyEntity);

// ── NOTIFICATIONS ──────────────────────────────────────────────────────
router.get('/notifications',                protect, notifCtrl.list);
router.put('/notifications/:id/read',       protect, notifCtrl.markRead);
router.put('/notifications/read-all',       protect, notifCtrl.markAllRead);

module.exports = router;
