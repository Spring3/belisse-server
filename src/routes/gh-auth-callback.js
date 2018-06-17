const crypto = require('crypto');

module.exports = (req, res) => { 
  const clientId = crypto.randomBytes(16).toString('hex');
  res.status(200);
  res.append('Token', req.user.accessToken);
  res.append('Client', clientId);
  return res.json({ ...req.user.profile._json });
}
