import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";

const getPagination = (query) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    const error = new Error(
      "page must be a positive integer and limit must be between 1 and 100",
    );
    error.statusCode = 400;
    throw error;
  }
  return { page, limit, skip: (page - 1) * limit };
};

const addDateRange = (query, startDate, endDate) => {
  if (!startDate && !endDate) return;
  const range = {};
  if (startDate) {
    range.$gte = new Date(startDate);
    if (Number.isNaN(range.$gte.getTime()))
      throw Object.assign(new Error("Invalid startDate"), { statusCode: 400 });
  }
  if (endDate) {
    range.$lte = new Date(endDate);
    if (Number.isNaN(range.$lte.getTime()))
      throw Object.assign(new Error("Invalid endDate"), { statusCode: 400 });
  }
  query.createdAt = range;
};

export const createDoctor = async (req, res) => {
  res.status(201).json(await Doctor.create(req.body));
};

export const getDoctors = async (req, res) => {
  const { search, specialization, startDate, endDate } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (search) {
    const term = String(search).slice(0, 100);
    const pattern = new RegExp(
      term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    query.$or = [
      { name: pattern },
      { specialization: pattern },
      { hospital: pattern },
    ];
  }
  if (specialization) query.specialization = specialization;
  addDateRange(query, startDate, endDate);

  const [doctors, total] = await Promise.all([
    Doctor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(query),
  ]);
  res.json({
    data: doctors,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const getDoctorWithPatients = async (req, res) => {
  const [doctor, patients] = await Promise.all([
    Doctor.findById(req.params.id).lean(),
    Patient.find({ doctor: req.params.id }).sort({ createdAt: -1 }).lean(),
  ]);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json({ ...doctor, patients });
};
