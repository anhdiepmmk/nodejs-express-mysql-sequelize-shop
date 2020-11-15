const { getDb, ObjectID } = require("../util/database");

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  async save() {
    const db = await getDb();
    return db.collection("users").insertOne(this);
  }

  async addProductToCart(product) {
    const cart = this.cart ? this.cart : { items: [] };
    const items = cart.items;

    const foundIndex = items.findIndex((e) => {
      return e.productId.toString() === product._id.toString();
    });

    if (foundIndex >= 0) {
      items[foundIndex].quantity++;
    } else {
      items.push({
        productId: new ObjectID(product._id),
        quantity: 1,
      });
    }

    const db = await getDb();

    return db
      .collection("users")
      .updateOne({ _id: new ObjectID(this._id) }, { $set: { cart: cart } });
  }

  async getProductsInCart() {
    const cart = this.cart ? this.cart : { items: [] };
    const items = cart.items;

    const productIds = items.map((e) => {
      return e.productId;
    });

    const db = await getDb();
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map(e => {
          const item = items.find(i => {
              return i.productId.toString() === e._id.toString()
          })

          const quantity = item ? item.quantity : 1;
          e.quantity = quantity

          return e
        })
      }).catch(err => {
        console.log(err);
      })
  }

  static async findById(productId) {
    const db = await getDb();
    return db.collection("users").findOne({ _id: new ObjectID(productId) });
  }
}

module.exports = User;
