const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("auth_token");

    if (!token) {
      return res.status(401).json({ msg: "No Auth token" });
    }

    const isVerfied = jwt.verify(token, "passowdKey");
    if (!isVerfied) {
      return res.status(401).json({ msg: "token verification failed" });
    }

    req.user = isVerfied.id;
    req.token = token;

    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
module.exports = auth;
