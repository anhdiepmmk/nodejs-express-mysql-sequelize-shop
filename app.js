const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const { sequelize } = require("./util/database");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

User.hasMany(Product, {
  foreignKey: "userId",
  constraints: false,
});

Product.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
})

User.hasOne(Cart)
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })

Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })
Product.belongsToMany(Order, { through: OrderItem })

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        throw Error;
      }
    })
    .catch((err) => {
      console.log("=======catch========", err);
      res.end();
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize
  .sync({})
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        id: 1,
        name: "Diep Pham",
        email: "n08ni.dieppn@gmail.com",
      });
    }

    return user;
  }).then(user => {
    return user.createCart();
  })
  .catch((err) => {
    console.log("ERRRRRRR");
  })
  .finally(() => {
    console.log("finally");
    app.listen(3000);
  });
