"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

type SignInForm = {
    email: string;
    password: string;
};

const SignIn = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInForm>();

    const onSubmit = async (data: SignInForm) => {
        console.log(data);
        // API call will go here
        try {
            // const request = await fetch('/api/auth')
        } catch {

        }
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

                <h1 className="form-title">Welcome back</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="form-label">Email</label>
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            placeholder="Enter your email"
                            className="form-input"
                        />
                        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="form-label">Password</label>
                        <input
                            {...register("password", { required: "Password is required" })}
                            type="password"
                            placeholder="••••••••"
                            className="form-input"
                        />
                        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="mt-2 w-full h-12 rounded-lg bg-[#3b82f6] hover:bg-blue-700 text-white font-medium text-base transition-colors disabled:opacity-50 cursor-pointer">
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-gray-500 text-sm mt-2 text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="text-blue-500 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
