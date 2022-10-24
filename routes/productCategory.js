const express = require("express");
const { Product } = require("../models/product");
const productRoute = express.Router();
const auth = require("../server/authMiddelware");

productRoute.get("/api/products", auth, async (req, res) => {
  try {
    console.log(req.query.category);
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
productRoute.get("/api/products/search/:name", auth, async (req, res) => {
  try {
    console.log(req.query.category);
    const products = await Product.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    console.log(products);
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRoute.post("/api/rating", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    let product = await Product.findById(id);
    for (i = 0; i < product.rating.length; i++) {
      if ((product.rating[i].userId = req.user)) {
        product.rating.splice(i, 1);
        break;
      }
    }
    const ratingSchema = {
      userId: req.user,
      rating,
    };
    product.rating.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
productRoute.get("/api/deal-of-day", auth, async (req, res) => {
  try {
    let product = await Product.find({});
    product.sort((a, b) => {
      let asum = 0;
      let bsum = 0;
      for (i = 0; i < a.rating.length; i++) {
        asum += a.rating[i].rating;
      }
      for (i = 0; i < b.rating.length; i++) {
        bsum += b.rating[i].rating;
      }
      return asum < bsum ? 1 : -1;
    });

    res.json(product[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = productRoute;
