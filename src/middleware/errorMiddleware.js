export const errorHandler = (error, _req, res, _next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? "value";
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }
  if (error.name === "CastError") {
    return res
      .status(400)
      .json({ message: `Invalid ${error.path}: ${error.value}` });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : "Internal Server Error",
  });
};
