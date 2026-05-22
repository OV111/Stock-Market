"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";

type ForgotForm = { email: string };

const Logo = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative size-6">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.span key="down" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <TrendingDown className="text-red-500 size-5" />
            </motion.span>
          ) : (
            <motion.span key="up" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <TrendingUp className="text-[#3b82f6] size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <motion.span animate={{ color: hovered ? "#ef4444" : "#ffffff" }} transition={{ duration: 0.2 }} className="font-bold text-xl">
        Stoxly
      </motion.span>
    </Link>
  );
};

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setServerError(json.message);
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-3">
      <Logo />
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[400px] rounded-2xl border border-gray-700 bg-gray-800 p-8 flex flex-col gap-7"
        >
          {submitted ? (
            <div className="flex flex-col gap-3 text-center">
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                <svg className="size-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="text-sm text-gray-400">
                If an account with that email exists, we&apos;ve sent a password reset link. Check your inbox (and spam folder).
              </p>
              <Link href="/sign-in" className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 px-3 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full h-11 rounded-lg bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </motion.button>
              </form>

              <p className="text-gray-500 text-sm text-center">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
