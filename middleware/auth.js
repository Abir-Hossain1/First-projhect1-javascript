const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!authHeader) {
    res.status(401).json({ massage: "  Unauthorize" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(401).json({ massage: "  Unauthorize" });
      } else {
        req.user = user;
        next();
      }
    });
  }
};
