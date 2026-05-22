import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch (err) {
    console.error("[sign-up]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
