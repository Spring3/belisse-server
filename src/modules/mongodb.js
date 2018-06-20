const assert = require('assert');
const { parse } = require('url');
const { MongoClient, ObjectId } = require('mongodb');

assert(process.env.MONGODB_URI, 'MONGODB_URI is undefined');

let client = null;
let db = null;

function connect(url = process.env.MONGODB_URI) {
  if (!url) return Promise.reject(new Error('Connection url is undefined'));

  let dbName = parse(url);
  if (!dbName || !dbName.pathname) return Promise.reject(new Error('Malformed connection url'));
  dbName = dbName.pathname.substring(1); // to remove a slash

  if (client === null) {
    return MongoClient.connect(url)
      .then((mongoClient) => {
        client = mongoClient;
        db = client.db(dbName);
        return db;
      });
  }
  return Promise.resolve(db);
}

function disconnect() {
  if (client !== null) {
    client.close();
  }
}

module.exports = {
  connect,
  disconnect,
  ObjectId
};
