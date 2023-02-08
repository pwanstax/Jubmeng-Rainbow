import express from "express";
import usersRouter from "./user.route.js";
import productsRouter from "./product.route.js";
import { checkValidationError } from "../middlewares/error-handler.middleware.js";

const router = express.Router();

router.use("/", usersRouter);
router.use("/", productsRouter);

router.use(checkValidationError);

export default router;
