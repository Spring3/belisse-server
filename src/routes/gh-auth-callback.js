const uuid = require('uuid');

module.exports = (req, res) => {
  const data = { ...req.user._json, token: req.user.accessToken, appId: uuid.v4() };
  res.status(200).send(`<script>parent.window.opener.postMessage(${JSON.stringify(data)}, 'http://localhost')</script>`);
}
