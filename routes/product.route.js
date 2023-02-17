import express from "express";
import {
  getEachProducts,
  createProduct,
  getProducts,
  getProductInfo,
} from "../controllers/product.controller.js";
import auth from "../middlewares/jwt.middleware.js";

const router = express.Router();

router.route("/products/").get(getProducts);
router.route("/product/:type").post(auth.required, createProduct);
router.route("/products/:type").get(getEachProducts);
router.route("/product/:type/:id").get(getProductInfo);
export default router;
