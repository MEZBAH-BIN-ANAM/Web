const errorMiddleware = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";
  
    // Avoid leaking internal details in production
    const extraDetails = process.env.NODE_ENV === "development" ? err.extraDetails || err.stack : undefined;
  
    return res.status(status).json({
      success: false,
      status,
      message,
      ...(extraDetails && { extraDetails }),
    });
  };
  
  module.exports = errorMiddleware;
  