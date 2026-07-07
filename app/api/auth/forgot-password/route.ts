import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // Always return success to avoid user enumeration
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent" }, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${rawToken}`;

    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"Stoxly" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Reset your Stoxly password",
        html: `
          <p>Hi ${user.name},</p>
          <p>Click the link below to reset your password. It expires in 1 hour.</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });
    } else {
      // Dev fallback — log reset link to console when SMTP is not configured
      console.log("\n[Stoxly] Password reset link:", resetUrl, "\n");
    }

    return NextResponse.json({ message: "If that email exists, a reset link has been sent" }, { status: 200 });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
