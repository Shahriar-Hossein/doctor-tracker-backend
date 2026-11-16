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
    const inclusiveDate = new Date(endDate);
    if (Number.isNaN(inclusiveDate.getTime()))
      throw Object.assign(new Error("Invalid endDate"), { statusCode: 400 });
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(endDate))) {
      inclusiveDate.setUTCDate(inclusiveDate.getUTCDate() + 1);
      range.$lt = inclusiveDate;
    } else {
      range.$lte = inclusiveDate;
    }
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
    query.$text = { $search: term };
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

export const updateDoctor = async (req, res) => {
  const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: "Doctor not found" });
  res.json(updated);
};

export const deleteDoctor = async (req, res) => {
  if (await Patient.exists({ doctor: req.params.id })) {
    return res.status(409).json({
      message: "Reassign or remove this doctor's patients before deleting the doctor",
    });
  }
  const deleted = await Doctor.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Doctor not found" });
  res.status(204).send();
};

export const getDoctorWithPatients = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [doctor, patients, total] = await Promise.all([
    Doctor.findById(req.params.id).lean(),
    Patient.find({ doctor: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments({ doctor: req.params.id }),
  ]);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json({
    ...doctor,
    patients,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};
