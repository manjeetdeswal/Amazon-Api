const express = require("express");
const userRoute = express.Router();
const auth = require("../server/authMiddelware");
const { Product } = require("../models/product");
const User = require("../models/user");
const order = require("../models/order");
const Order = require("../models/order");
userRoute.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isFound = true;
        }
      }
      if (isFound) {
        let productt = user.cart.find((product1) =>
          product1.product._id.equals(product._id)
        );
        productt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRoute.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }

    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRoute.post("/api/save-address", auth, async (req, res) => {
  try {
    const { address } = req.body;

    let user = await User.findById(req.user);

    user.address = address;

    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRoute.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, price, address } = req.body;

    let products = [];
    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res.status(400).json({ msg: `${product.name} is out of stock` });
      }
    }
    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();
    let order = new Order({
      products,
      totalPrice: price,
      address,
      userId: req.user,
      orderAt: new Date().getTime(),
    });
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRoute.get("/api/orders/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });

    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = userRoute;
