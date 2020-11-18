const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    authenticatedUser: req.session.user,
    message: req.flash('message')
  });
};

exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "admin") {
    User.findOne({})
      .then((user) => {
        req.session.user = user;
        req.session.save((err) => {
          res.redirect("/");
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    req.flash('message', 'Username and password do not match!')
    res.redirect('/login')
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
