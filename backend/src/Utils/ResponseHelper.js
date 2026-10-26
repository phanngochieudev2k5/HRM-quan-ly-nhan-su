export const sendSuccess = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, message = 'Đã có lỗi xảy ra', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || error) : null
  });
};
