"use client";

import { useForm } from "react-hook-form";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(formData) {
    // Clear any previous server error
    setServerError("");

    try {
      const { data } = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // data.data contains: { user, accessToken, refreshToken }
      login(data.data.user, data.data.accessToken, data.data.refreshToken);

      // Redirect to products page after login
      router.push("/products");
    } catch (err) {
      // err.response.data is your { success: false, message: '...' } envelope
      setServerError(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>
      {justRegistered && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg mb-4">
          Account created! Please check your email to verify, then sign in.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />

        {/* Forgot password link */}
        <div className="text-right -mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Server-side error (wrong credentials etc) */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
