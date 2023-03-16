import express from "express";
import auth from "../middlewares/jwt.middleware.js";
import {
  createReview,
  getReviews,
  getReviewInfo,
} from "../controllers/review.controller.js";
const router = express.Router();

router.route("/review").post(auth.required, createReview);
router.route("/review/:type").get(getReviews);
router.route("/review-info/:id").get(auth.required, getReviewInfo);

export default router;
