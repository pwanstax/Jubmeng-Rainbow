import express from "express";
import {
  createUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getNavbarInfo,
  checkLogin,
  setSeller,
  getUserInfo,
  addUserInfo,
} from "../controllers/user.controller.js";
import {errorHandler} from "../middlewares/error-handler.middleware.js";
import auth from "../middlewares/jwt.middleware.js";

const router = express.Router();

router.route("/user").post(createUser);
router.route("/user/login").post(login);
router.route("/user/logout").post(auth.required, logout); // logout
router.route("/user/forgot-password").post(forgotPassword); // send resetlink to email
router.route("/user/reset-password").post(resetPassword); // reset password
router.route("/user/navbar").get(auth.required, getNavbarInfo); // get navbar info
router.route("/user/setseller/:id").patch(auth.required, setSeller);
router.route("/user/check-login").get(auth.required, checkLogin); // check if user login
router
  .route("/user/info")
  .post(auth.required, getUserInfo)
  .patch(auth.required, addUserInfo); // get user's info & (add and update user info)

export default router;
