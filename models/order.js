const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Object, required: true },
    },
  ],
  user: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
  },
});

module.exports = mongoose.model("Order", orderSchema);
