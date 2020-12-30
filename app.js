const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const flash = require("connect-flash");
const csrf = require("csurf");
const fileUpload = require('express-fileupload')

const errorController = require("./controllers/error");

const mongoConnectionString = "mongodb://shop:shop2123@localhost:27017/shop?authSource=admin";

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const NotFoundError = require("./errors/NotFoundError");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
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

app.use(csrf({ session: true }));

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
      .finally(() => { });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.authenticatedUser = req.session.user;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((err, req, res, next) => {
  if (err instanceof NotFoundError) {
    res.status(err.httpStatusCode).send(err.message);
  } else {
    res.status(500).render("error", {
      pageTitle: "Error!",
      path: "/error",
      err: err,
    });
  }
});

mongoose
  .connect(mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((result) => {
    console.log("Mongodb Connected!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
