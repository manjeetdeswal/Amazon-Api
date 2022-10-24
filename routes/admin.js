const express = require("express");
const Order = require("../models/order");
const { Product } = require("../models/product");
const adminRoute = express.Router();
const adminMiddle = require("../server/adminMiddle");

adminRoute.post("/admin/add-products", adminMiddle, async (req, res) => {
  try {
    const { name, price, quantity, description, images, category } = req.body;
    let product = new Product({
      name,
      price,
      quantity,
      description,
      images,
      category,
    });
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRoute.get("/admin/get-products", adminMiddle, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRoute.get("/admin/get-orders", adminMiddle, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRoute.get("/admin/get-analytics", adminMiddle, async (req, res) => {
  try {
    const orders = await Order.find({});
    let totalEarnings = 0;
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].products.length; j++) {
        totalEarnings +=
          orders[i].products[j].quantity * orders[i].products[j].product.price;
      }
    }

    let mobileEarnings = await fetchCategoryWiseProduct("Mobiles");
    let essEarnings = await fetchCategoryWiseProduct("Essentials");
    let appEarnings = await fetchCategoryWiseProduct("Appliances");
    let booksEarnings = await fetchCategoryWiseProduct("Books");
    let fasionEarnings = await fetchCategoryWiseProduct("Fashion");

    let earnings = {
      totalEarnings,
      mobileEarnings,
      essEarnings,
      appEarnings,
      booksEarnings,
      fasionEarnings,
    };
    res.json(earnings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRoute.post("/admin/delete-product", adminMiddle, async (req, res) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);

    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRoute.post("/admin/change-order-status", adminMiddle, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();
    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function fetchCategoryWiseProduct(category) {
  let earnings = 0;

  let categoryOrder = await Order.find({
    "products.product.category": category,
  });

  for (let i = 0; i < categoryOrder.length; i++) {
    for (let j = 0; j < categoryOrder[i].products.length; j++) {
      earnings +=
        categoryOrder[i].products[j].quantity *
        categoryOrder[i].products[j].product.price;
    }
  }
  return earnings;
}

module.exports = adminRoute;
