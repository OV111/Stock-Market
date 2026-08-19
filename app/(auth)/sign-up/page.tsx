"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Logo } from "@/components/ui/Logo";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

const SignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    setServerError("");
    try {
      const res = await fetch(`/api/auth/sign-up`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message);
        return;
      }
      router.push("/");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-3">
      <Logo iconSize="size-6" />

      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[400px] rounded-2xl border border-gray-700 bg-gray-800 p-8 flex flex-col gap-7"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-gray-500">Start tracking markets for free</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="Your name"
                className="h-11 px-3 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

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
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                  })}
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Confirm password</label>
              <div className="relative">
                <input
                  {...register("confirm", {
                    required: "Please confirm your password",
                    validate: (v) => v === watch("password") || "Passwords do not match",
                  })}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full px-3 pr-10 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
            </div>

            {serverError && (
              <p className="text-red-400 text-sm text-center -mt-1">{serverError}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full h-11 rounded-lg bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-600 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </a>

          <p className="text-gray-500 text-sm text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
