const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const order = require("../models/order");
const { Int32 } = require("mongodb");

exports.getProducts = (req, res, next) => {
  console.log("getProducts", page);
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      next(err);
    });
};

const ITEM_PER_PAGE = 1

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1

  const totalItems = await Product.find().countDocuments();

  Product.find()
    .skip((page - 1) * ITEM_PER_PAGE)
    .limit(ITEM_PER_PAGE)
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        pages: +totalItems,
        current: +page,
        // currentPage: +page,
        // hasPreviousPage: page > 1,
        // hasNextPage: ITEM_PER_PAGE * page < totalItems,
        // nextPage: page + 1,
        // previousPage: page - 1,
        // lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addProductToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .deleteItemInCartByProductId(prodId)
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((e) => {
        return { product: e.productId._doc, quantity: e.quantity };
      });

      const order = new Order({
        user: {
          name: req.user.name,
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      return res.redirect("/orders");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      next(err);
    });

  return;
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        next(new Error('Order not found.'));
      } else {
        if (order.user.userId.toString() === req.session.user._id.toString()) {
          // fs.readFile(invoicePath, (err, data) => {
          //   if (err) {
          //     next(err);
          //   } else {
          //     res.setHeader("Content-Type", "application/pdf");
          //     res.setHeader(
          //       "Content-Disposition",
          //       'inline; filename="' + invoiceName + '"'
          //     );
          //     res.send(data);
          //   }
          // });

          const filestream = fs.createReadStream(invoicePath)
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
          filestream.pipe(res)
        } else {
          next(new Error('Unauthorized'));
        }
      }
    })
    .catch((err) => {
      next(err);
    });
};
