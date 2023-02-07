import express from "express";
import {createUser, login} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/user").post(createUser);
router.route("/user/login").post(login);

export default router;
