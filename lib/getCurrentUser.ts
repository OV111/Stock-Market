import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) return null;

    return { id: user._id.toString(), name: user.name, email: user.email };
  } catch {
    return null;
  }
}
