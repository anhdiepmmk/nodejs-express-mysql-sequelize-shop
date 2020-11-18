const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const flash = require('connect-flash');

const errorController = require("./controllers/error");

const mongoConnectionString =
  "mongodb+srv://admin:admina123@cluster0.tkdbb.mongodb.net/test?retryWrites=true&w=majority";

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "3MlrtFPD521GNDii",
    store: new MongoStore({
      url: mongoConnectionString,
      collection: "sessions",
    }),
  })
);

app.use(flash());

app.use((req, res, next) => {
  if (req.session.user) {
    User.findOne({ _id: req.session.user._id })
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  } else {
    next();
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(mongoConnectionString)
  .then((result) => {
    console.log("Mongodb Connected!");
    User.findOne()
      .then((user) => {
        if (!user) {
          return new User({
            name: "Diep",
            email: "n08ni.dieppn@gmail.com",
            cart: { items: [] },
          }).save();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        app.listen(3000);
      });
  })
  .catch((err) => {
    console.log(err);
  });
