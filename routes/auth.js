const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jsonwebtokem = require("jsonwebtoken");
const auth = require("../server/authMiddelware");

const authRouter = express.Router();

authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User email already existes" });
    }

    const hashedPass = await bcrypt.hash(password, 8);

    let user = new User({
      email,
      name,
      password: hashedPass,
    });

    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log(e);
  }
});

authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not existes" });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ msg: "Incorrect Passowrd" });
    }

    const token = jsonwebtokem.sign({ id: user._id }, "passowdKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/tokenisValid", async (req, res) => {
  try {
    const token = req.header("auth_token");
    if (!token) {
      return res.json(false);
    }
    const isVerfied = jsonwebtokem.verify(token, "passowdKey");

    if (!isVerfied) {
      return res.json(false);
    }

    const user = await User.findById(isVerfied.id);
    if (!user) {
      return res.json(false);
    }
    return res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  console.log(req.user);
  res.json({ ...user._doc, token: req.token });
});
module.exports = authRouter;
