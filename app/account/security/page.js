"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

function EyeToggle({ visible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle password visibility"
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
    >
      {visible ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
          <path
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
        </svg>
      )}
    </button>
  );
}

function CheckItem({ met, children }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        met ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 13l4 4L19 7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default function SecurityPage() {
  const [serverMsg, setServerMsg] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("newPassword") || "";

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const metCount = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    metCount <= 1
      ? "Weak"
      : metCount === 2
        ? "Fair"
        : metCount === 3
          ? "Good"
          : "Strong";
  const strengthColor =
    metCount <= 1
      ? "text-red-500"
      : metCount === 2
        ? "text-amber-600"
        : "text-emerald-600";

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
    <div className="flex flex-col gap-6 font-sans">
      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="border-b border-gray-100 pb-5">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Change Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a strong password you haven&apos;t used before to protect
            your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Current Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                Current Password
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot current password?
              </a>
            </div>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                error={errors.currentPassword?.message}
                className="pr-10"
                {...register("currentPassword", {
                  required: "Enter your current password",
                })}
              />
              <EyeToggle
                visible={showCurrent}
                onClick={() => setShowCurrent((v) => !v)}
              />
            </div>
          </div>

          {/* New & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  error={errors.newPassword?.message}
                  className="pr-10"
                  {...register("newPassword", {
                    required: "Enter a new password",
                    minLength: { value: 6, message: "At least 6 characters" },
                    validate: (val) =>
                      val !== watch("currentPassword") ||
                      "New password must differ from current",
                  })}
                />
                <EyeToggle
                  visible={showNew}
                  onClick={() => setShowNew((v) => !v)}
                />
              </div>

              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Strength</span>
                    <span className={`font-semibold ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-1/3 h-full rounded-full transition-colors ${
                          metCount > i * 1.3
                            ? metCount <= 2
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                            : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  className="pr-10"
                  {...register("confirmPassword", {
                    required: "Confirm your new password",
                    validate: (val) =>
                      val === newPassword || "Passwords do not match",
                  })}
                />
                <EyeToggle
                  visible={showConfirm}
                  onClick={() => setShowConfirm((v) => !v)}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Passwords must match exactly.
              </p>
            </div>
          </div>

          {/* Requirements checklist */}
          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 text-xs text-gray-600">
            <span className="font-bold text-gray-700 block mb-2">
              Password must include:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <CheckItem met={checks.length}>
                At least 8 characters long
              </CheckItem>
              <CheckItem met={checks.upper}>
                At least one capital letter
              </CheckItem>
              <CheckItem met={checks.number}>At least one number</CheckItem>
              <CheckItem met={checks.special}>
                At least one special character
              </CheckItem>
            </div>
          </div>

          {serverMsg && (
            <div
              className={`text-sm px-4 py-3 rounded-xl border
                 ${
                   serverMsg.type === "success"
                     ? "bg-green-50 text-green-700 border-green-200"
                     : "bg-red-50 text-red-600 border-red-200"
                 }`}
            >
              {serverMsg.text}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              loading={isSubmitting}
              className="!px-6 !py-2.5 !bg-[#19324d] hover:!bg-[#13263b] !text-white !text-sm !font-semibold !rounded-xl !shadow-sm"
            >
              Update password
            </Button>
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-1">
            Active Login Sessions
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Devices currently authenticated and logged into your account.
          </p>
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/30">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-xs">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    This device
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">
                    Active Now
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Current browser session
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium hidden md:inline-block">
              Current Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
