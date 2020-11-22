const User = require("../models/user");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const sendMailBySendGridTransporter = (payload) => {
  //create new transporter by send grid
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:
          "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",
      },
    })
  );

  //send email by transporter above
  return transporter.sendMail(payload);
};

const sendMailBySMTPTransporter = (payload) => {
  //create new transporter by send grid
  const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.sendgrid.net",
    port: 25,
    auth: {
      user: "apikey",
      pass:
        "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",
    },
  });

  //send email by transporter above
  return transporter.sendMail(payload);
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    message: req.flash("message"),
  });
};

exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        req.flash("message", "User not found!");
        return res.redirect("/login");
      } else {
        bcrypt
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              req.session.user = user;
              req.session.save((err) => {
                res.redirect("/");
              });
            } else {
              req.flash("message", "Password is incorrect!");
              res.redirect("/login");
            }
          })
          .catch((err) => {
            console.log(err);
            req.flash("message", "Something went wrong!");
            res.redirect("/login");
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    message: req.flash("message"),
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ username })
    .then((user) => {
      if (user) {
        req.flash("message", "Email already exist, please pick different one!");
        return res.redirect("/login");
      } else {
        return bcrypt
          .hash(password, 12)
          .then((encryptedPassword) => {
            const user = new User({
              name,
              username,
              password: encryptedPassword,
              cart: { items: [] },
            });
            return user.save();
          })
          .then((user) => {
            sendMailBySMTPTransporter({
              to: user.username,
              from: "dieppn@sskpi.com",
              subject: "Sigup succeeded!!",
              html: "<h1>You successfully signed up!!</h1>",
            })
              .then((result) => {})
              .catch((err) => {
                console.log("auth.transporter.sendMail.catch", err);
              })
              .finally(() => {
                res.redirect("/login");
              });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "Reset password",
    path: "/reset",
    message: req.flash("message"),
  });
};

exports.postReset = (req, res, next) => {
  console.log(req);
};