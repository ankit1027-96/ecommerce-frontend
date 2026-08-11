"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/formField";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

      // On successful registration - send to login
      router.push("/login?registered=true");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create account</h2>
        <p className="text-gray-500 text-sm mt-1">Start shopping today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="firstName"
            label="First name"
            placeholder="John"
            error={errors.firstName?.message}
            registration={register("firstName", {
              required: "Required",
              minLength: { value: 2, message: "Too short" },
            })}
          />

          <FormField
            id="lastName"
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            registration={register("lastName", {
              required: "Required",
              minLength: { value: 2, message: "Too short" },
            })}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            className="col-span-2"
            error={errors.email?.message}
            registration={register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
        </div>

        <FormField
          id="phone"
          label="Phone"
          type="tel"
          placeholder="9876543210"
          error={errors.phone?.message}
          registration={register("phone", {
            required: "Phone is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
            },
          })}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          registration={register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "At least 6 characters",
            },
          })}
        />

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
