import express from "express";
import {createUser, login, setSeller} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/user").post(createUser);
router.route("/user/login").post(login);
router.route("/user/setseller/:id").patch(setSeller);

export default router;
