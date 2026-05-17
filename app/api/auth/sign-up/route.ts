import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectDB();
  const { name, email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 13);
  const user = new User({ name, email, password: hashedPassword });
  user.save();

  return NextResponse.json({ message: "User Created" }, { status: 201 });
}
