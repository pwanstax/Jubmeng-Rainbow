import express from "express";
import {
  getEachProducts,
  createProduct,
  getProducts,
  getProductInfo,
} from "../controllers/product.controller.js";

const router = express.Router();

router.route("/product/:type").post(createProduct);
router.route("/products/:type").get(getEachProducts);
router.route("/products/").get(getProducts);
router.route("/product/:type/:id").get(getProductInfo);
export default router;
