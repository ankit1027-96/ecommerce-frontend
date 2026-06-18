"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  async function onSubmit(formData) {
    setServerError("");

    try {
      await api.post("/api/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      // On successfull registration - send to login
      router.push("/login?registered=true");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    }
  }
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create account</h2>
        <p className="text-grey-500 text-sm mt-1"> Start shopping today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register("firstName", {
              required: "Required",
              minLength: { value: 2, message: "Too short" },
            })}
          />

          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName", {
              required: "Required",
              minLength: { value: 2, message: "Too short" },
            })}
          />
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
        </div>
        <Input
          label="Phone"
          type="tel"
          placeholder="9876543210"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
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
              message: "At least 6 characters",
            },
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
