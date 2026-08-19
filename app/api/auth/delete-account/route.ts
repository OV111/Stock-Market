import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";

export async function DELETE() {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await User.findByIdAndDelete(auth.id);

    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.json({ message: "Account deleted" }, { status: 200 });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
