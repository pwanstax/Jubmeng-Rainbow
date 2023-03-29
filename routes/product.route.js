import express from "express";
import {
  getEachProducts,
  createProduct,
  getProducts,
  getProductInfo,
  getMyProducts,
  getTags,
} from "../controllers/product.controller.js";
import auth from "../middlewares/jwt.middleware.js";
import {upload} from "../middlewares/image.middleware.js";

const router = express.Router();

router.route("/products/").get(getProducts);
router
  .route("/product/:type")
  .post(
    auth.required,
    upload.fields([{name: "images", maxCount: 10}]),
    createProduct
  );

router.route("/products/:type").get(getEachProducts);
router.route("/product/:type/:id").get(getProductInfo);
router.route("/products/me/:username").get(auth.required, getMyProducts);
router.route("/products/tags/:type").get(getTags);
export default router;
