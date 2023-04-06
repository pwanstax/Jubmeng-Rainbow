import express from "express";
import {
  createProduct,
  getProducts,
  getProductInfo,
  getMyProducts,
  getTags,
  deleteProduct,
} from "../controllers/product.controller.js";
import auth from "../middlewares/jwt.middleware.js";
import {upload} from "../middlewares/image.middleware.js";

const router = express.Router();

router.route("/products").get(getProducts);
router
  .route("/product")
  .post(
    auth.required,
    upload.fields([{name: "images", maxCount: 10}]),
    createProduct
  );

router.route("/product/:id").get(getProductInfo).delete(deleteProduct);
// .delete(auth.required, deleteProduct);
router.route("/products/me/:username").get(auth.required, getMyProducts);
router.route("/products/tags").get(getTags);
export default router;
