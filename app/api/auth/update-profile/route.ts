import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      auth.id,
      { name: trimmed },
      { returnDocument: "after" }
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Profile updated",
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[update-profile]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
