import express from "express";
import {
  createUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkLogin,
} from "../controllers/auth.controller.js";
import {errorHandler} from "../middlewares/error-handler.middleware.js";
import auth from "../middlewares/jwt.middleware.js";
import {upload} from "../middlewares/image.middleware.js";

const router = express.Router();

router.route("/auth/register").post(createUser);
router.route("/auth/login").post(login);
router.route("/auth/logout").post(auth.required, logout); // logout
router.route("/auth/forgot-password").post(forgotPassword); // send resetlink to email
router.route("/auth/reset-password").post(resetPassword); // reset password
router.route("/auth/check-login").get(auth.required, checkLogin); // check if user login

export default router;
