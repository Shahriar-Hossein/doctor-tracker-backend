import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";

export const getDashboardStats = async (_req, res) => {
  const [
    totalDoctors,
    totalPatients,
    patientsPerDoctor,
    dailyPatients,
    conditionBreakdown,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Doctor.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "doctor",
          as: "patients",
        },
      },
      {
        $project: {
          name: 1,
          specialization: 1,
          patientCount: { $size: "$patients" },
        },
      },
      { $sort: { patientCount: -1 } },
    ]),
    Patient.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]),
    Patient.aggregate([
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, condition: "$_id", count: 1 } },
    ]),
  ]);

  res.json({
    summary: { totalDoctors, totalPatients },
    patientsPerDoctor,
    dailyPatients,
    conditionBreakdown,
  });
};
