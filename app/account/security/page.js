"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import api from "@/lib/api";

export default function SecurityPage() {
  const [serverMsg, setServerMsg] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("newPassword");

  async function onSubmit(formData) {
    setServerMsg(null);
    try {
      await api.put("/api/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setServerMsg({ type: "success", text: "Password changed successfully" });
      reset();
    } catch (err) {
      setServerMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md">
      <h2 className="font-semibold text-gray-900 mx-1">Change Password</h2>
      <p className="text-sm text-gray-400 mb-5">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="current password"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "Enter your current password",
          })}
        />

        <Input
          label="New password"
          type="password"
          placeholder="••••••••"
          errors={errors.newPassword?.message}
          {...register("newPassword", {
            required: "Enter a new password",
            minLength: { value: 6, message: "At least 6 characters" },
            validate: (val) =>
              val !== watch("currentPassword") ||
              "New password must differ from current",
          })}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Confirm your new password",
            validate: (val) => val === newPassword || "Passwords do not match",
          })}
        />

        {serverMsg && (
          <div
            className={`text-sm px-3 py-2.5 rounded-lg
                 ${
                   serverMsg.type === "success"
                     ? "bg-green-50 text-green-700"
                     : "bg-red-50 text-red-600"
                 }`}
          >
            {serverMsg.text}
          </div>
        )}
        <Button type="submit" loading={isSubmitting}>
          Update password 
        </Button>
      </form>
    </div>
  );
}
