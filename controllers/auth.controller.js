import passport from "passport";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config({path: ".env"});
const secret = process.env.JWT_SECRET;

// @desc Create new user
// @route POST /auth/register
// @access Private
export const createUser = (req, res, next) => {
  const user = new User();
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user
    .save()
    .then(function () {
      return res.json({user: user.toAuthJSON()});
    })
    .catch(function (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .send({error: "Username or E-mail already exists"});
      }
      next(error);
    });
};

// @desc Login with E-mail + Password
// @route POST /auth/login
// @access Private
export const login = (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({errors: {email: "can't be blank"}});
  }
  if (!req.body.user.password) {
    return res.status(422).json({errors: {password: "can't be blank"}});
  }
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (user) {
      user.token = user.generateJWT();
      const cookieData = user.toAuthJSON();

      res.cookie("auth", cookieData, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: 0,
        path: "/",
      });

      res.header(user.getIdJSON()).send("Login success");
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
};

// @desc Make user logout by clear cookie
// @route POST /auth/logout
// @access Private
export const logout = async (req, res, next) => {
  // also use for collecting log in the future
  const cookie_name = req.body.cookie_name;
  console.log(cookie_name);
  res.clearCookie(cookie_name, {
    path: "/",
  });
  res.status(200).send("logout succesfully");
};

// @desc Send email with the link for reset password
// @route POST /auth/forgot-password
// @access Public
export const forgotPassword = async (req, res, next) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({email: email}, {_id: 1, username: 1});
    if (user) {
      const token = jwt.sign({userId: user._id}, secret, {expiresIn: "1h"});
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MONKEY_EMAIL_ADR,
          pass: process.env.MONKEY_EMAIL_PWD,
        },
      });

      const mailOptions = {
        from: `Jubmeng Rainbow <${process.env.MONKEY_EMAIL_ADR}>`,
        to: email,
        subject: "Password reset instructions",
        html: `<p>Hi ${user.username},</p>
             <p>Click <a href="${process.env.FRONTEND_PORT}/resetPassword?token=${token}">here</a> to reset your password.</p>
             <p>This link will expire in 1 hour.</p>`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res.status(500).json({message: "Internal server error"});
        }
        return res
          .status(200)
          .json({message: "Password reset instructions sent"});
      });
    } else {
      return res.status(404).json({message: "User not found"});
    }
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Reset user's password
// @route POST /auth/reset-password
// @access Public (with token)
export const resetPassword = async (req, res, next) => {
  const token = req.body.token;
  const password = req.body.password;

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.userId;

    User.findById(userId, (err, user) => {
      if (err) {
        return res.status(500).json({message: "Internal server error"});
      }
      if (!user) {
        return res.status(404).json({message: "User not found"});
      }
      user.setPassword(password);
      user.save((err, updatedUser) => {
        if (err) {
          return res.status(500).json({message: "Internal server error"});
        }
        res.status(200).json({message: "Password reset successfully"});
      });
    });
  } catch (error) {}
};

// @desc Check if the user login
// @route GET /auth/check-login
// @access Private
export const checkLogin = async (req, res, next) => {
  return res.status(200).json({isLogin: true});
};
