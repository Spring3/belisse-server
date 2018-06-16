module.exports = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  return res.status(err.status || 500).send({
    message: err.message,
    status: err.status || 500
  });
};
