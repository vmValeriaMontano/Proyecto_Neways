function errorHandler(err, req, res, next) {
  console.error("Error no controlado:", err.stack);
  res.status(500).json({
    message: "Ocurrió un error interno en el servidor.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;