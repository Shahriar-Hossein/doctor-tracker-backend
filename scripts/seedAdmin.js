import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (
  !ADMIN_NAME ||
  !ADMIN_EMAIL ||
  !ADMIN_PASSWORD ||
  ADMIN_PASSWORD.length < 8
) {
  throw new Error(
    "Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 8 characters",
  );
}

await connectDB();
const email = ADMIN_EMAIL.trim().toLowerCase();
const existing = await User.findOne({ email });
if (existing) {
  console.log(`Admin account already exists: ${email}`);
} else {
  await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD });
  console.log(`Created admin account: ${email}`);
}
await mongoose.disconnect();
