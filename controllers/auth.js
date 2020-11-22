const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  const origin = req.get("origin");
  const username = req.body.username;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    } else {
      User.findOne({ username: username })
        .then((user) => {
          console.log(user);
          if (!user) {
            req.flash("message", "No account with that email found!");
            res.redirect("/reset");
          } else {
            const token = buffer.toString("hex");
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
            return user.save();
          }
        })
        .then((result) => {
          if (typeof result === "object") {
            sendMailBySMTPTransporter({
              to: result.username,
              from: "dieppn@sskpi.com",
              subject: "Reset password",
              html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="${origin}/reset/${result.resetToken}">link</a> to set a new password</p>
              `,
            });

            req.flash(
              "message",
              `We sent a email include reset password url to ${result.username}`
            );
            res.redirect("/reset");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token })
    .then((user) => {
      const errorMessage = req.flash("errorMessage");

      if (user) {
        if (user.resetTokenExpiration < Date.now()) {
          errorMessage.push("This link has expired");
        }
      } else {
        errorMessage.push("User not found");
      }

      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/reset",
        message: req.flash("message"),
        errorMessage,
        ableToReset: errorMessage.length === 0,
        token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const token = req.body.token;
  const password = req.body.password;

  User.findOne({ resetToken: token })
    .then((user) => {
      if (user) {
        if (user.resetTokenExpiration < Date.now()) {
          req.flash("message", "This link has expired");
          res.redirect("/login");
        } else {
          return bcrypt
            .hash(password, 12)
            .then((encryptedPassword) => {
              user.password = encryptedPassword;
              user.resetToken = undefined;
              user.resetTokenExpiration = undefined;
              return user.save();
            })
            .then((result) => {
              req.flash(
                "message",
                "Your password has reset. Now you can login with your new password"
              );
              res.redirect("/login");
            });
        }
      } else {
        req.flash("errorMessage", "User not found");
        res.redirect("back");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
