const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  jwt.verify(accessToken, process.env.JWT_AUTH_TOKEN, async (err, mail) => {
    if (mail) {
      req.mail = mail;
      next();
    } else if (err.message === "TokenExpiredError") {
      return res.status(403).send({
        success: false,
        msg: "Access token expired",
      });
    } else {
      console.log(err);
      return res
        .status(403)
        .send({ err, success: false, msg: "User Authentication Failed" });
    }
  });
};

module.exports = auth;
