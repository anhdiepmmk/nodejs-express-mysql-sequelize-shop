const Product = require("../models/product");
const Cart = require("../models/cart");
const e = require("express");
const CartItem = require("../models/cart-item");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      //res.send(products)
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);

  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({
        where: {
          id: prodId,
        },
      });
    })
    .then((products) => {
      const quantity =
        products.length > 0 ? products[0].CartItem.quantity + 1 : 1;

      console.log("quantity==============", quantity);

      Product.findByPk(prodId)
        .then((product) => {
          return fetchedCart.addProduct(product, {
            through: { quantity },
          });
        })
        .then((result) => {
          console.log("fetchedCard - addProduct", result);
          res.redirect("/cart");
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send("Product not found");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({
        where: {
          id: prodId,
        },
      });
    })
    .then((products) => {
      const product = products[0];
      return product.CartItem.destroy({ force: true });
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      req._cart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      req._products = products;
      return req.user.createOrder();
    })
    .then((order) => {
      const products = req._products;

      return order.addProducts(
        products.map((e) => {
          e.OrderItem = { quantity: e.CartItem.quantity };
          return e;
        })
      );
    })
    .then((result) => {
      return CartItem.destroy({
        where: {
          CartId: req._cart.id
        },
        force: true
      })
    })
    .then((result) => {
      return res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      req._products = null;
      req._cart = null;
    });
};

exports.getOrders = (req, res, next) => {
  req
    .user
    .getOrders({include: ['Products']})
    .then((orders) => {
      //res.send(orders)
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      res.end();
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
