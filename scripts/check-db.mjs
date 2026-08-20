import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in .env.local");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connection OK");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("MongoDB connection FAILED:", err.message);
  process.exit(1);
});
