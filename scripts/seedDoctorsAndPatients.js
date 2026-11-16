import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Doctor } from "../src/models/Doctor.js";
import { Patient } from "../src/models/Patient.js";

const doctorsData = JSON.parse(
  fs.readFileSync(new URL("./data/popularDoctors.json", import.meta.url)),
);

const firstNames = [
  "Tanvir", "Nusrat", "Arif", "Farhana", "Kamrul", "Sadia", "Imran", "Tahmina", "Rakibul", "Ayesha",
  "Shahidul", "Salma", "Mahmudul", "Fatema", "Monir", "Rubina", "Asif", "Nasrin", "Tareq", "Sharmin",
];
const lastNames = [
  "Ahmed", "Jahan", "Ali", "Islam", "Rahman", "Hossain", "Akter", "Hasan", "Khan", "Sultana",
  "Chowdhury", "Begum", "Khatun", "Parvin", "Haque", "Bhuiyan", "Mollah", "Talukder",
];
const conditions = [
  "Hypertension", "Type 2 Diabetes", "Asthma", "Migraine",
  "Gastritis", "Arthritis", "Chest Pain", "Back Pain",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 20 doctors have patients, 1 doctor has highest (30), some have too many, 10 have 0
const patientCounts = [
  30, 24, 20, 18, 15, 12, 10, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

await connectDB();

await Doctor.deleteMany({});
await Patient.deleteMany({});

const createdDoctors = await Doctor.insertMany(doctorsData);

const patients = [];
createdDoctors.forEach((doctor, idx) => {
  const count = patientCounts[idx] || 0;
  for (let i = 0; i < count; i++) {
    patients.push({
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
      condition: pick(conditions),
      notes: "Routine checkup and consultation.",
      doctor: doctor._id,
    });
  }
});

await Patient.insertMany(patients);

console.log(`Seeded ${createdDoctors.length} doctors and ${patients.length} patients.`);
console.log(`Top doctor: ${createdDoctors[0].name} (${patientCounts[0]} patients)`);
console.log(`Doctors with patients: ${patientCounts.filter((c) => c > 0).length}`);
console.log(`Doctors with 0 patients: ${patientCounts.filter((c) => c === 0).length}`);

await mongoose.disconnect();
