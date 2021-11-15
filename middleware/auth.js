const jwt = require("jsonwebtoken");
const config = require("config");

//Shortcut, export the function.
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied, no token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next(); //must pass control to next middleware.
  } catch (ex) {
    res.status(400).send("Invalid Token.");
  }
};
