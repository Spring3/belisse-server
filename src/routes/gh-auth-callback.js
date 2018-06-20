const crypto = require('crypto');
const { connect, ObjectId } = require('../modules/mongodb.js');

async function saveApplicationData(appId) {
  const db = await connect();
  const applicationId = new ObjectId(appId);
  return db.collection('Application').insert({
    _id: applicationId,
    enabled: true,
    device: 'desktop',
    createdAt: new Date()
  });
}

async function saveUserData(appId, githubId, username) {
  const db = await connect();
  return db.collection('User').findAndModify(
    { githubId },
    [],
    {
      $set: {
        username,
        updatedAt: new Date()
      },
      $addToSet: {
        applications: new ObjectId(appId)
      },
      $setOnInsert: {
        _id: new ObjectId(),
        githubId,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
}

module.exports = async (req, res) => {
  const appId = req.query.appId || req.headers.application;
  const githubProfile = req.user.profile;
  let promise = Promise.resolve();
  if (req.user.accessToken && !appId) {
    const applicationId = crypto.randomBytes(12).toString('hex');
    res.append('Application', applicationId);
    promise = Promise.all([
      saveApplicationData(applicationId),
      saveUserData(applicationId, githubProfile.id, githubProfile.username)
    ]);
  } else if (req.user.accessToken && appId) {
    promise = saveUserData(appId, githubProfile.id, githubProfile.username);
  }
  promise
    .then(() => {
      res.status(200);
      res.append('Authorization', req.user.accessToken);
      res.append('Cache-Control', 'no-store');
      res.append('Pragma', 'no-cache');
      return res.json({ ...githubProfile._json });
    })
    .catch((e) => {
      console.error(e, appId, githubProfile);
      return res.status(500).send('Internal Server Error');
    });
};
