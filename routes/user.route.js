import express from "express";
import {
  getNavbarInfo,
  setSeller,
  getUserInfo,
  addUserInfo,
  getSaveForLater,
  addSaveForLater,
  deleteSaveForLater,
} from "../controllers/user.controller.js";
import {errorHandler} from "../middlewares/error-handler.middleware.js";
import auth from "../middlewares/jwt.middleware.js";
import {upload} from "../middlewares/image.middleware.js";

const router = express.Router();

router.route("/user/navbar").get(auth.required, getNavbarInfo); // get navbar info
router.route("/user/setseller/:id").patch(auth.required, setSeller);

router
  .route("/user/info")
  .post(auth.required, getUserInfo)
  .patch(auth.required, upload.single("image"), addUserInfo); // get user's info & (add and update user info)
router
  .route("/user/save-for-later")
  .get(auth.required, getSaveForLater)
  .patch(auth.required, addSaveForLater)
  .delete(auth.required, deleteSaveForLater);

export default router;
