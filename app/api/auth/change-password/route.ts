import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current and new password are required" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(auth.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (!user.password) {
      return NextResponse.json(
        { message: "This account uses Google sign-in and has no password to change" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "Password updated" }, { status: 200 });
  } catch (err) {
    console.error("[change-password]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
