import express from "express";
import usersRouter from "./user.route.js";
import productsRouter from "./product.route.js";
import reviewsRouter from "./review.route.js";
import authsRouter from "./auth.route.js";
import {checkValidationError} from "../middlewares/error-handler.middleware.js";

const router = express.Router();

router.use("/", usersRouter);
router.use("/", productsRouter);
router.use("/", reviewsRouter);
router.use("/", authsRouter);

router.use(checkValidationError);

export default router;
