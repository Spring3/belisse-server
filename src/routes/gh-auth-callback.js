const uuid = require('uuid');

module.exports = (req, res) => {
  res.status(200).send({ ...req.user._json, token: req.user.accessToken, appId: uuid.v4() });
}
