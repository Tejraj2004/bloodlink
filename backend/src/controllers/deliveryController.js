const Delivery     = require('../models/Delivery');
const BloodRequest = require('../models/BloodRequest');
const { generateDeliveryId } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/response');

exports.createDelivery = async (req, res) => {
  try {
    const { requestId, fromBankId, toHospitalId, unitIds, driverId, driverName, vehicleNo, estimatedArrival } = req.body;
    const delivery = await Delivery.create({
      deliveryId: generateDeliveryId(),
      request: requestId,
      fromBank: fromBankId,
      toHospital: toHospitalId,
      units: unitIds || [],
      driver: driverId || null,
      driverName, vehicleNo,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
    });

    await BloodRequest.findByIdAndUpdate(requestId, { status: 'In Transit' });

    const sync = req.app.get('sync');
    if (sync) {
      await sync.deliveryCreated(delivery.toObject());
      // Update request status sync
      const request = await BloodRequest.findById(requestId);
      if (request) await sync.requestStatusChanged(request.toObject(), req.user.role);
    }

    return successResponse(res, { delivery }, 'Delivery created.', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, coordinates, notes } = req.body;
    const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId });
    if (!delivery) return errorResponse(res, 'Delivery not found.', 404);

    delivery.status = status;
    if (coordinates) delivery.currentLocation = { type: 'Point', coordinates };
    if (notes) delivery.notes = notes;
    if (status === 'Picked Up')  delivery.pickedUpAt  = new Date();
    if (status === 'Delivered') {
      delivery.deliveredAt = new Date();
      await BloodRequest.findByIdAndUpdate(delivery.request, { status: 'Fulfilled', fulfilledAt: new Date() });
    }
    await delivery.save();

    const sync = req.app.get('sync');
    if (sync) {
      await sync.deliveryStatusUpdated(delivery.toObject());
      if (status === 'Delivered') {
        const request = await BloodRequest.findById(delivery.request);
        if (request) await sync.requestFulfilled(request.toObject());
      }
    }

    return successResponse(res, { delivery }, 'Delivery updated.');
  } catch (err) { return errorResponse(res, err.message); }
};

exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId })
      .populate('fromBank', 'bankName city location contactPhone')
      .populate('toHospital', 'hospitalName city location emergencyContact')
      .populate('driver', 'name phone')
      .populate('units', 'unitId bloodGroup component');
    if (!delivery) return errorResponse(res, 'Delivery not found.', 404);
    return successResponse(res, { delivery });
  } catch (err) { return errorResponse(res, err.message); }
};

exports.listDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (req.user.role === 'ambulance') filter.driver = req.user._id;
    if (status) filter.status = status;

    const deliveries = await Delivery.find(filter)
      .populate('fromBank', 'bankName city')
      .populate('toHospital', 'hospitalName city emergencyContact')
      .populate('driver', 'name phone')
      .sort('-createdAt').limit(50);
    return successResponse(res, { deliveries });
  } catch (err) { return errorResponse(res, err.message); }
};

exports.updateLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId });
    if (!delivery) return errorResponse(res, 'Delivery not found.', 404);

    delivery.currentLocation = { type: 'Point', coordinates };
    await delivery.save();

    const sync = req.app.get('sync');
    if (sync) sync.deliveryLocation(delivery.toObject(), coordinates);

    return successResponse(res, {}, 'Location updated.');
  } catch (err) { return errorResponse(res, err.message); }
};
