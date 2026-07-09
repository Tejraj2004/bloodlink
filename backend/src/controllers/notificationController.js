const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = { recipient: req.user._id };
    if (unread === 'true') filter.read = false;

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort('-createdAt').skip((page - 1) * limit).limit(+limit);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    return successResponse(res, { notifications, unreadCount, total });
  } catch (err) { return errorResponse(res, err.message); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() }
    );
    return successResponse(res, {}, 'Marked as read.');
  } catch (err) { return errorResponse(res, err.message); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    return successResponse(res, {}, 'All marked as read.');
  } catch (err) { return errorResponse(res, err.message); }
};
