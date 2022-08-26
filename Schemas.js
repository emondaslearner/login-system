const mongoose = require('mongoose')

const user = new mongoose.Schema(
    {
      firstName:String,
      lastName:String,
      userName:String,
      email:String,
      password:String,
      emailStatus:String
    },
    { timestamps: true }
  );
  
  const signUp = mongoose.model("users", user);


  module.exports.signUp = signUp