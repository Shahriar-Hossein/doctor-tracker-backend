import express from "express";
import { getMe, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema } from "../validators/schemas.js";

const router = express.Router();
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
