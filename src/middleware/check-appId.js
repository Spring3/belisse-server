const { connect, ObjectId } = require('../modules/mongodb.js');

module.exports = async (req, res, next) => {
  const appId = req.query.appId || req.headers.application;
  if (appId) {
    let objectId = null;
    try {
      objectId = new ObjectId(appId);
    } catch (e) {
      return res.status(400).send('Bad Request');
    }
    const db = await connect();
    const app = await db.collection('Application').findOne({ _id: new ObjectId(appId) });
    if (!app) {
      return res.status(400).send('Bad Request');
    }
  }
  return next();
};
