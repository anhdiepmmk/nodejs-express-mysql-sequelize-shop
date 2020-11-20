const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addProductToCart = function (product) {
  const updatedCart = this.cart ? this.cart : { items: [] };
  const items = updatedCart.items;

  const foundIndex = items.findIndex((e) => {
    return e.productId.toString() === product._id.toString();
  });

  if (foundIndex >= 0) {
    items[foundIndex].quantity++;
  } else {
    items.push({
      productId: product._id,
      quantity: 1,
    });
  }

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemInCartByProductId = function (productId) {
  const updatedCart = this.cart ? this.cart : { items: [] };

  updatedCart.items = updatedCart.items.filter((e) => {
    return e.productId.toString() !== productId.toString();
  });

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = {items: []};
  return this.save();
};

module.exports = mongoose.model("User", userSchema);