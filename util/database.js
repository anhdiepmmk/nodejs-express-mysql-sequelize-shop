const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

const getDb = async () => {
  if (db) {
    console.log("Use existing connection!");
    return db;
  }

  console.log("Create new connection!");
  const client = await MongoClient.connect(
    "mongodb+srv://admin:admina123@cluster0.tkdbb.mongodb.net/test?retryWrites=true&w=majority"
  );
  db = client.db("test");
  return db;
};

exports.getDb = getDb;
exports.mongodb = mongodb;
exports.ObjectID = mongodb.ObjectID;
