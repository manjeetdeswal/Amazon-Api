const jwt = require("jsonwebtoken");
const User = require("../models/user");
const admin = async (req, res, next) => {
  try {
    const token = req.header("auth_token");

    if (!token) {
      return res.status(401).json({ msg: "No Auth token" });
    }

    const isVerfied = jwt.verify(token, "passowdKey");
    if (!isVerfied) {
      return res.status(401).json({ msg: "token verification failed" });
    }

    const user = await User.findById(isVerfied.id);
    if (user.type == "user" && user.type == "seller") {
      res.status(401).json({ msg: "UnAuthorized user" });
    }
    req.user = isVerfied.id;
    req.token = token;

    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = admin;
