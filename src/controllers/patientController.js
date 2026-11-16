import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";

const paginationFor = (query) => {
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

export const createPatient = async (req, res) => {
  if (!(await Doctor.exists({ _id: req.body.doctor }))) {
    return res.status(404).json({ message: "Assigned doctor not found" });
  }
  res.status(201).json(await Patient.create(req.body));
};

export const getPatients = async (req, res) => {
  const { search, condition, doctorId, startDate, endDate } = req.query;
  const { page, limit, skip } = paginationFor(req.query);
  const query = {};
  if (search) {
    const term = String(search).slice(0, 100);
    query.$text = { $search: term };
  }
  if (condition)
    query.condition = new RegExp(
      `^${String(condition).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i",
    );
  if (doctorId) query.doctor = doctorId;
  addDateRange(query, startDate, endDate);

  const [patients, total] = await Promise.all([
    Patient.find(query)
      .populate("doctor", "name specialization hospital")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(query),
  ]);
  res.json({
    data: patients,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const updatePatient = async (req, res) => {
  if (req.body.doctor && !(await Doctor.exists({ _id: req.body.doctor }))) {
    return res.status(404).json({ message: "Assigned doctor not found" });
  }
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("doctor", "name specialization");
  if (!updated) return res.status(404).json({ message: "Patient not found" });
  res.json(updated);
};

export const deletePatient = async (req, res) => {
  const deleted = await Patient.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Patient not found" });
  res.status(204).send();
};
