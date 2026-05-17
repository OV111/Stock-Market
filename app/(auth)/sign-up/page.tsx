"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
};

const SignUp = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    console.log(data);
    // API call will go here
    try {
      const request = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (request.ok) {
        router.push("/sign-in");
      }
      console.log(request);
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-gray-900 items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-white font-bold text-xl">Stoxly</span>
          </Link>
        </div>

        <h1 className="form-title">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="form-label">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              placeholder="Enter your name"
              className="form-input"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="Enter your email"
              className="form-input"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Password</label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" },
              })}
              type="password"
              placeholder="••••••••"
              className="form-input"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full h-12 rounded-lg bg-[#3b82f6] hover:bg-blue-700 text-white font-medium text-base transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-2 text-center">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
