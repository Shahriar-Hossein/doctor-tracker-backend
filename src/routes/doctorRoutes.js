import express from "express";
import {
  createDoctor,
  getDoctorWithPatients,
  getDoctors,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { doctorSchema } from "../validators/schemas.js";

const router = express.Router();
router.use(protect);
router.route("/").post(validate(doctorSchema), createDoctor).get(getDoctors);
router.get("/:id", getDoctorWithPatients);

export default router;
