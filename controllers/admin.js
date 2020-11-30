const Product = require("../models/product");
const { body, validationResult } = require("express-validator");
const NotFoundError = require("../errors/NotFoundError");
const fs = require("fs");

exports.getValidateProduct = () => {
  let results = [
    body("title")
      .notEmpty()
      .withMessage("Tiêu đề không được bỏ trống")
      .bail()
      .isLength({
        max: 255,
      })
      .withMessage("Tiêu đề không được dài quá 255 ký tự"),

    body("price")
      .notEmpty()
      .withMessage("Price không được bỏ trống")
      .bail()
      .isNumeric()
      .withMessage("Price phải là số"),

    body("description")
      .notEmpty()
      .withMessage("Mô tả không được bỏ trống")
      .bail()
      .isLength({
        max: 500,
      })
      .withMessage("Mô tả không được dài quá 255 ký tự"),
  ];

  // if (mode === "add") {
  //   results.push(
  //     body("image")
  //     .custom((value, { req }) => {
  //       if (req.files && req.files.image) {
  //         const allowedMimetype = ["image/png", "image/jpg", "image/jpeg"];
  //         if (!allowedMimetype.includes(req.files.image.mimetype)) {
  //           throw new Error("File không đúng định dạng");
  //         }
  //       } else {
  //         throw new Error("Vui lòng chọn image");
  //       }
  //     })
  //   );
  // }

  return results;
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    authenticatedUser: req.session.user,
    message: req.flash("message"),
    old: req.flash("old").shift(),
    validationResultErrors: req.flash("validationResultErrors").shift(),
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);

  if (req.files && req.files.image) {
    const allowedMimetype = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedMimetype.includes(req.files.image.mimetype)) {
      errors.errors.push({
        value: undefined,
        msg: "File không đúng định dạng",
        param: "image",
        location: "body",
      });
    }
  } else {
    errors.errors.push({
      value: undefined,
      msg: "Vui lòng chọn image",
      param: "image",
      location: "body",
    });
  }

  if (!errors.isEmpty()) {
    console.log(errors);
    req.flash("validationResultErrors", errors);
    req.flash("old", {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
    });
    return res.redirect("back");
  }

  const image = req.files.image;
  const filename = "uploads/product_photo/" + image.name;
  image
    .mv("./public/" + filename)
    .then((result) => {
      console.log(`Moved ${filename}`, result);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log(image);

  const title = req.body.title;
  const imageUrl = filename;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;

  const product = new Product({ title, imageUrl, price, description, userId });
  product
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  const old = req.flash("old").shift();

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        throw new NotFoundError("Product not found");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        message: req.flash("message"),
        old: old ? old : product,
        validationResultErrors: req.flash("validationResultErrors").shift(),
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const errors = validationResult(req);

  if (req.files && req.files.image) {
    const allowedMimetype = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedMimetype.includes(req.files.image.mimetype)) {
      errors.errors.push({
        value: undefined,
        msg: "File không đúng định dạng",
        param: "image",
        location: "body",
      });
    }
  }

  if (!errors.isEmpty()) {
    req.flash("validationResultErrors", errors);
    req.flash("old", {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
    });
    return res.redirect("back");
  }

  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImage = req.files.image;

  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      if (product.userId.toString() === req.user._id.toString()) {
        if (updatedImage) {
          console.log("updatedImage", updatedImage);
          const filename =
            "uploads/product_photo/" +
            Date.now() +
            "." +
            updatedImage.mimetype.split("/").pop();

          updatedImage
            .mv("./public/" + filename)
            .then((result) => {
              console.log(`Moved ${filename}`, result);
            })
            .catch((err) => {
              console.log(err);
            });

          //remove file
          const imageUrl = product.imageUrl;
          fs.unlink("./public/" + imageUrl, (err) => {
            console.log(err);
          });

          product.imageUrl = filename;
        }

        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product
          .save()
          .then((result) => {
            req.flash("message", "Updated.");
            res.redirect("back");
          })
          .catch((err) => {
            next(err);
          });
      } else {
        req.flash("message", "Permission denied.");
        res.redirect("back");
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user._id }, (err) => {
    res.redirect("/admin/products");
  });
};
