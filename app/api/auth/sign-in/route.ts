import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: "This account uses Google sign-in" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({ id: user._id.toString(), email: user.email });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json(
      { message: "Signed in", user: { id: user._id, name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (err) {
    console.error("[sign-in]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
