const mongoose = require("mongoose");

const uri =
  "mongodb+srv://amazon:amazon@cluster0.9pksi.mongodb.net/ecommerce?retryWrites=true&w=majority";

const Connect = () => {
  mongoose
    .connect(uri)
    .then((data) => {
      console.log("Database Connection established", data.connection.host);
    })
    .catch((err) => {
      console.error(err.message);
    });
};

module.exports = Connect;
