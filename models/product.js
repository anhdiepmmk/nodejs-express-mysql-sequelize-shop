const { ObjectID } = require("mongodb");
const { getDb, mongodb } = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
  }

  async save() {
    const db = await getDb();
    return db.collection("products").insertOne(this);
  }

  static async update(productId, product) {
    const db = await getDb();
    return db
      .collection("products")
      .updateOne({ _id: new mongodb.ObjectID(productId) }, { $set: product });
  }

  static async deleteById(productId) {
    const db = await getDb();
    return db.collection("products").deleteOne({ _id: new mongodb.ObjectID(productId) });
  }

  static async fetchAll() {
    const db = await getDb();
    return db.collection("products").find({}).toArray();
  }

  static async findById(productId) {
    const db = await getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectID(productId) })
      .next();
  }
}

module.exports = Product;
