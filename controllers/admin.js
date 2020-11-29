const Product = require("../models/product");
const { body, validationResult } = require("express-validator");

exports.getValidateProduct = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Tiêu đề không được bỏ trống")
      .bail()
      .isLength({
        max: 255,
      })
      .withMessage("Tiêu đề không được dài quá 255 ký tự"),

    body("imageUrl")
      .notEmpty()
      .withMessage("Image URL không được bỏ trống")
      .bail()
      .isLength({
        max: 255,
      })
      .withMessage("Image URL không được dài quá 255 ký tự")
      .bail()
      .isURL()
      .withMessage("Image URL không hợp lệ"),

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

  if (!errors.isEmpty()) {
    req.flash("validationResultErrors", errors);
    req.flash("old", {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      price: req.body.price,
      description: req.body.description,
    });
    return res.redirect("back");
  }

  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
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
        throw new Error("Product not found");
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

  if (!errors.isEmpty()) {
    req.flash("validationResultErrors", errors);
    req.flash("old", {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      price: req.body.price,
      description: req.body.description,
    });
    return res.redirect("back");
  }

  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      if (product.userId.toString() === req.user._id.toString()) {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDesc;
        product
          .save()
          .then((result) => {
            req.flash("message", "Updated.");
            res.redirect("back");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        req.flash("message", "Permission denied.");
        res.redirect("back");
      }
    })
    .catch((err) => {
      console.log(err);
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
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user._id }, (err) => {
    res.redirect("/admin/products");
  });
};
