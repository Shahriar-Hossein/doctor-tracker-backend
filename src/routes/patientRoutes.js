import express from "express";
import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { patientSchema, patientUpdateSchema } from "../validators/schemas.js";

const router = express.Router();
router.use(protect);
router.route("/").post(validate(patientSchema), createPatient).get(getPatients);
router
  .route("/:id")
  .patch(validate(patientUpdateSchema), updatePatient)
  .delete(deletePatient);

export default router;
