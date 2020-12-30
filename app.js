require('dotenv').config()

const path = require("path");
const fs = require('fs');
const https = require('https');

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const csrf = require("csurf");
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require("./controllers/error");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const NotFoundError = require("./errors/NotFoundError");

app.use(helmet())
app.use(compression())

if (false) {
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
  )

  app.use(morgan('combined', { stream: accessLogStream }))
}

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
      url: process.env.DB_URL,
      collection: "sessions",
    }),
  })
);

app.use(csrf({ session: true }));

const privateKey = fs.readFileSync('./key.pem');
const certificate = fs.readFileSync('./cert.pem');

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
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((result) => {
    console.log("Mongodb Connected!");
    const port = process.env.PORT || 3000
    if (false) {
      https.createServer({ cert: certificate, key: privateKey }, app).listen(port, () => {
        console.log(`Express run at ${port} port.`);
      })
    } else {
      app.listen(port, () => {
        console.log(`Express run at ${port} port.`);
      })
    }
  })
  .catch((err) => {
    console.log(err);
  });
