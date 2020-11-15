const path = require("path");

const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findOne()
    .then((user) => {
      req.user = user
      next();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {});
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://admin:admina123@cluster0.tkdbb.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log('Mongodb Connected!');
    User.findOne()
      .then((user) => {
        if (!user) {
          return new User({
            name: "Diep",
            email: "n08ni.dieppn@gmail.com",
            cart: { items: [] },
          }).save()
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
