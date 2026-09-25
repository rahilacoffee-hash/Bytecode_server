export function success(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function created(res, data = null, message = "Created successfully") {
  return success(res, data, message, 201);
}

export function error(
  res,
  message = "Something went wrong",
  statusCode = 500,
  code = "INTERNAL_ERROR"
) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}