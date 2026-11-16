import express from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorWithPatients,
  getDoctors,
  updateDoctor,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { doctorSchema } from "../validators/schemas.js";

const router = express.Router();
router.use(protect);
router.route("/").post(validate(doctorSchema), createDoctor).get(getDoctors);
router
  .route("/:id")
  .get(getDoctorWithPatients)
  .patch(validate(doctorSchema), updateDoctor)
  .delete(deleteDoctor);

export default router;
