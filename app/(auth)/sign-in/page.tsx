"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";

type SignInForm = {
  email: string;
  password: string;
};

const Logo = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/"
      className="flex items-center gap-2 w-fit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative size-6">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.span key="down" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <TrendingDown className="text-red-500 size-6" />
            </motion.span>
          ) : (
            <motion.span key="up" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <TrendingUp className="text-[#3b82f6] size-6" />
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

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    try {
      console.log(data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-8">
      <Logo />

      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[400px] rounded-2xl border border-gray-700 bg-gray-800 p-8 flex flex-col gap-7"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your Stoxly account</p>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full px-3 pr-10 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full h-11 rounded-lg bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-gray-500 text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
