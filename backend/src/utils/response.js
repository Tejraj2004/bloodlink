exports.successResponse = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

exports.errorResponse = (res, message = 'Server error', statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

exports.paginatedResponse = (res, data, total, page, limit, message = 'Success') =>
  res.status(200).json({
    success: true, message, data,
    pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) }
  });
