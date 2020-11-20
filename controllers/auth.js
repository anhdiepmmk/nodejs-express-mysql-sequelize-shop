const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    message: req.flash("message")
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
    authenticatedUser: req.session.user,
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
          .then(() => {
            res.redirect("/login");
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
