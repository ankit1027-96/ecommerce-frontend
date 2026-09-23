"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { FormField } from "@/components/ui/formField";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8 font-sans">
      <ProfileSection />
      <AddressSection />
    </div>
  );
}

function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
    }
  }, [user, reset]);

  async function onSubmit(formData) {
    setServerMsg(null);
    try {
      const { data } = await api.put("/api/users/profile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      updateUser(data.data);
      setServerMsg({ type: "success", text: "Profile updated successfully" });
      setEditing(false);
    } catch (err) {
      setServerMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    }
  }

  return (
    <article className="bg-white border border-gray-200/90 rounded-2xl p-7 shadow-xs">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your personal identification and contact coordinates
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition"
            type="button"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              First Name
            </span>
            <span className="block mt-1 text-sm font-semibold text-gray-800">
              {user?.firstName || "-"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Last Name
            </span>
            <span className="block mt-1 text-sm font-semibold text-gray-800">
              {user?.lastName || "-"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Email Address
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-gray-800">
                {user?.email || "-"}
              </span>
              {user?.emailVerified && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-green-200">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Phone Number
            </span>
            <span className="block mt-1 text-sm font-semibold text-gray-800">
              {user?.phone || "-"}
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="profile-firstName"
              label="First name"
              placeholder="First name"
              error={errors.firstName?.message}
              registration={register("firstName", {
                required: "Required",
                minLength: { value: 2, message: "Too short" },
              })}
            />
            <FormField
              id="profile-lastName"
              label="Last name"
              placeholder="Last name"
              error={errors.lastName?.message}
              registration={register("lastName", {
                required: "Required",
                minLength: { value: 2, message: "Too short" },
              })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-semibold text-gray-600">
              Email
            </label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full text-sm rounded-lg border border-gray-200 py-2.5 px-3.5
                bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <span className="text-xs text-gray-400">
              Email cannot be changed
            </span>
          </div>

          <FormField
            id="profile-phone"
            label="Phone"
            placeholder="10-digit mobile number"
            error={errors.phone?.message}
            registration={register("phone", {
              required: "Required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit Indian number",
              },
            })}
          />

          {serverMsg && (
            <div
              className={`text-sm px-4 py-3 rounded-xl
               ${
                 serverMsg.type === "success"
                   ? "bg-green-50 text-green-700 border border-green-200"
                   : "bg-red-50 text-red-600 border border-red-200"
               }`}
            >
              {serverMsg.text}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              loading={isSubmitting}
              className="!bg-[#19324d] hover:!bg-[#13263b] !text-white !text-sm !font-semibold !px-6 !py-2.5 !rounded-lg !shadow-xs"
            >
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setServerMsg(null);
              }}
              className="!bg-white hover:!bg-gray-50 !text-gray-700 !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !border !border-gray-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}

const EMPTY_ADDRESS = {
  type: "home",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  isDefault: false,
};

function AddressSection() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const { data } = await api.get("/api/users/addresses");
      setAddresses(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(addressId) {
    if (!confirm("Remove this address")) return;
    try {
      await api.delete(`/api/users/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
    } catch (err) {
      alert("Failed to delete addresses");
    }
  }
  function handleEdit(address) {
    setEditingAddr(address);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingAddr(null);
    setServerMsg(null);
  }

  async function handleFormSubmit(formData) {
    setServerMsg(null);
    try {
      if (editingAddr) {
        await api.put(`/api/users/addresses/${editingAddr._id}`, formData);
      } else {
        await api.post("/api/users/addresses", formData);
      }
      await fetchAddresses();
      handleCloseForm();
    } catch (err) {
      setServerMsg(err.response?.data?.message || "Failed to save address");
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-400 py-4">Loading addresses...</div>
    );
  }

  const defaultAddress = addresses.find((a) => a.isDefault);
  const otherAddresses = addresses.filter((a) => !a.isDefault);

  return (
    <article className="bg-white border border-gray-200/90 rounded-2xl p-7 shadow-xs">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage existing addresses or add delivery locations
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/70 px-3.5 py-2 rounded-lg transition"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Add New Address
          </button>
        )}
      </div>

      {!showForm && (
        <>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-400">No saved addresses yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {defaultAddress && (
                <AddressCard
                  address={defaultAddress}
                  onEdit={() => handleEdit(defaultAddress)}
                  onDelete={() => handleDelete(defaultAddress._id)}
                  highlighted
                />
              )}
              {otherAddresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  onEdit={() => handleEdit(addr)}
                  onDelete={() => handleDelete(addr._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <AddressForm
          initial={editingAddr || EMPTY_ADDRESS}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          serverError={serverMsg}
          isEditing={!!editingAddr}
        />
      )}
    </article>
  );
}

function AddressCard({ address, onEdit, onDelete, highlighted }) {
  return (
    <div
      className={`rounded-xl p-5 text-sm ${
        highlighted
          ? "border-2 border-blue-600/80 bg-blue-50/20"
          : "border border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">
              {address.firstName} {address.lastName}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 capitalize">
              {address.type}
            </span>
            {address.isDefault && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
                Default Address
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`},{" "}
            {address.city}, {address.state} - {address.zipCode},{" "}
            {address.country}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            Phone: {address.phone}
          </p>
        </div>

        {highlighted ? (
          <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
          </div>
        ) : (
          <div className="flex gap-3 shrink-0 ml-4">
            <button
              onClick={onEdit}
              type="button"
              className="text-blue-600 hover:underline text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              type="button"
              className="text-red-500 hover:underline text-xs font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {highlighted && (
        <div className="mt-4 pt-3 border-t border-blue-100 flex items-center gap-4 text-xs font-medium text-gray-500">
          <button
            onClick={onEdit}
            type="button"
            className="hover:text-gray-900 transition-colors"
          >
            Edit
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={onDelete}
            type="button"
            className="hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function AddressForm({ initial, onSubmit, onCancel, serverError, isEditing }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initial,
  });

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="pt-2 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
          {isEditing ? "Edit Address" : "Add New Address"}
        </h3>
        <span className="text-xs text-gray-400">
          All fields required unless marked optional
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Address Type
        </label>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          {["home", "work", "other"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                {...register("type")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="addr-firstName"
          label="First name"
          placeholder="First name"
          error={errors.firstName?.message}
          registration={register("firstName", { required: "Required" })}
        />
        <FormField
          id="addr-lastName"
          label="Last name"
          placeholder="Last name"
          error={errors.lastName?.message}
          registration={register("lastName", { required: "Required" })}
        />
      </div>

      <FormField
        id="addr-phone"
        label="Phone"
        placeholder="10-digit mobile number"
        error={errors.phone?.message}
        registration={register("phone", {
          required: "Required",
          pattern: { value: /^[6-9]\d{9}$/, message: "Invalid number" },
        })}
      />

      <FormField
        id="addr-line1"
        label="Address line 1"
        placeholder="House no., street, area"
        error={errors.addressLine1?.message}
        registration={register("addressLine1", { required: "Required" })}
      />
      <FormField
        id="addr-line2"
        label="Address Line 2 (optional)"
        placeholder="Landmark, apartment, suite, etc."
        error={errors.addressLine2?.message}
        registration={register("addressLine2")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="addr-city"
          label="City"
          placeholder="City"
          error={errors.city?.message}
          registration={register("city", { required: "Required" })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-gray-600">
            State
          </label>
          <select
            {...register("state", { required: "Required" })}
            className={`w-full text-sm rounded-lg py-2.5 px-3.5 bg-white text-gray-900 transition cursor-pointer border
                    ${errors.state ? "border-red-500" : "border-gray-200"}`}
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && (
            <span className="text-xs text-red-500">{errors.state.message}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="addr-zip"
          label="PIN code"
          placeholder="6-digit PIN code"
          error={errors.zipCode?.message}
          registration={register("zipCode", {
            required: "Required",
            pattern: { value: /^\d{6}$/, message: "6-digit PIN code" },
          })}
        />
        <FormField
          id="addr-country"
          label="Country"
          placeholder="Country"
          registration={register("country")}
        />
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 select-none">
            Set as default address
          </span>
        </label>
      </div>

      {serverError && (
        <div className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          loading={isSubmitting}
          className="!bg-[#19324d] hover:!bg-[#13263b] !text-white !text-sm !font-semibold !px-6 !py-2.5 !rounded-lg !shadow-xs"
        >
          {isEditing ? "Save changes" : "Add address"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="!bg-white hover:!bg-gray-50 !text-gray-700 !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !border !border-gray-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
