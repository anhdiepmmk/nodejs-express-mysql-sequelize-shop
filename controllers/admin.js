const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  req.user
    .createProduct({
      title,
      imageUrl,
      price,
      description,
    })
    .then((product) => {
      console.log(product);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  req.user
    .getProducts({
      where: {
        id: prodId,
      },
    })
    .then((products) => {
      if (!products) {
        return res.redirect("/");
      }

      const product = products[0];
      product
        .getUser()
        .then((result) => {
          console.log("======================", result, "==================");
        })
        .catch((err) => {
          console.log(err);
        });

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
      res.end();
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.update(
    {
      title: updatedTitle,
      price: updatedPrice,
      imageUrl: updatedImageUrl,
      description: updatedDesc,
    },
    {
      where: { id: prodId },
    }
  )
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
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

  Product.destroy({ where: { id: prodId } })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      res.send(err);
    });
};
