const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT;
const connect = require("./connect");
const Schemas = require("./Schemas");
const sendOTP = require("./sentOtp");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const auth = require("./auth");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

connect();

const random = () => {
  return Math.round(100000 + Math.random() * 900000);
};

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/singUp", async (req, res) => {
  try {
    const checkUserName = await Schemas.signUp.find({
      userName: req.body.userName,
    });
    if (checkUserName.length == 0) {
      const hashingPassword = await bcrypt.hash(req.body.password, 10);
      const singUpData = await {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: hashingPassword,
        emailStatus: "unverified",
      };
      const dataSave = await Schemas.signUp(singUpData);
      const data = await dataSave.save();

      const otp = await random();
      await sendOTP(req.body.email, otp);

      const hashingOtp = await bcrypt.hash(otp.toString(), 10);

      res
        .status(200)
        .cookie("otp", hashingOtp, {
          expires: new Date(new Date().getTime() + 600000),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .json({ success: true, email: req.body.email });
    } else {
      res.status(500).json({ success: null });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/verifyEmail", async (req, res) => {
  const hashOtp = req.cookies.otp;
  const otp = req.body.otp;

  const verifyOtp = await bcrypt.compare(otp, hashOtp);

  if (verifyOtp) {
    await Schemas.signUp.findOneAndUpdate(
      { userName: req.body.userName },
      { emailStatus: "verified" }
    );
    res.status(200).json({ status: verifyOtp });
  }

  res.status(400).json({ status: verifyOtp });
});

app.post("/login", async (req, res) => {
  try {
    const checkUserName = await Schemas.signUp.find({
      userName: req.body.userName,
    });

    if (checkUserName.length != 0) {
      const verifyPassword = await bcrypt.compare(
        req.body.password,
        checkUserName[0].password
      );
      if (verifyPassword) {
        const accessToken = await jwt.sign(
          { data: req.body.userName },
          process.env.JWT_AUTH_TOKEN,
          {
            expiresIn: "30d",
          }
        );

        res
          .status(200)
          .cookie("accessToken", accessToken, {
            expires: new Date(new Date().getTime() + 24 * 60 * 60 * 30),
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .json({ loginStatus: true });
      } else {
        res.status(401).json({ loginStatus: false });
      }
    } else {
      res.status(401).json({ loginStatus: false });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.post("/searchUser", async (req, res) => {
  const checkUserName = await Schemas.signUp.find({
    userName: req.body.userName,
  });
  if (checkUserName.length == 0) {
    res.status(403).json({ success: false, data: [] });
  } else {
    const otp = await random();
    await sendOTP(checkUserName[0].email, otp);

    const hashingOtp = await bcrypt.hash(otp.toString(), 10);

    res
      .status(200)
      .cookie("forgetPasswordOtp", hashingOtp, {
        expires: new Date(new Date().getTime() + 600000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({ success: true, data: checkUserName });
  }
});

app.post("/verifyForgottenOtp", async (req, res) => {
  const otp = req.cookies.forgetPasswordOtp;
  const inputOtp = req.body.otp;

  const verifyOtp = await bcrypt.compare(inputOtp, otp);

  if (verifyOtp) {
    res.status(200).json({ status: verifyOtp });
  }else{
    res.status(400).json({ status: verifyOtp });
  }
});

app.post("/changePassword", async (req, res) => {
  try {
    const password = req.body.password;

    const hashingPassword = await bcrypt.hash(password, 10);

    await Schemas.signUp.findOneAndUpdate(
      { userName: req.body.userName },
      { password: hashingPassword }
    );
    res.status(200).json({ status: true });
  } catch (err) {
    res.status(500).json({ status: false });
  }
});

app.get("/verifyAccess", auth, (req, res) => {
  res.status(200).json({ success: true, msg: "Success" });
});

app.get("/logout", (req, res) => {
  console.log('hit')
  res
    .clearCookie("accessToken")
    .send("logout");
});

app.listen( port || 3000, () => {
  console.log("server is running port " + port || 3000);
});
