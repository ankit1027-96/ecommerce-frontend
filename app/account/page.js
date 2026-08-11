"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { FormField } from "@/components/ui/formField";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8">
      <ProfileSection />
      <AddressSection />
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuth();
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
      await api.put("/api/user/profile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Personal Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "First name", value: user?.firstName },
            { label: "Last name", value: user?.lastName },
            { label: "Email", value: user?.email },
            { label: "Phone", value: user?.phone },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-gray-400 text-xs mb-0.5">{field.label}</p>
              <p className="text-gray-900 font-medium">{field.value || "-"} </p>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
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
              className={`text-sm px-3 py-2 rounded-lg
               ${
                 serverMsg.type === "success"
                   ? "bg-green-50 text-green-700"
                   : "bg-red-50 text-red-600"
               }`}
            >
              {serverMsg.text}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setServerMsg(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
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
      const { data } = await api.get("/api/user/addresses");
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
      await api.delete(`/api/user/addresses/${addressId}`);
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
        await api.put(`/api/user/addresses/${editingAddr._id}`, formData);
      } else {
        await api.post("/api/user/addresses", formData);
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            + Add new
          </button>
        )}
      </div>

      {!showForm && (
        <>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-400">No saved addresses yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
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
    </div>
  );
}

function AddressCard({ address, onEdit, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {address.firstName} {address.lastName}
            </span>
            {address.isDefault && (
              <span
                className="text-xs bg-blue-100 text-blue-700
                px-2 py-0.5 rounded-full font-medium"
              >
                Default
              </span>
            )}
            <span
              className="text-xs text-gray-400 capitalize bg-gray-100
              px-2 py-0.5 rounded-full"
            >
              {address.type}
            </span>
          </div>
          <p className="text-gray-600">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-gray-600">
            {address.city}, {address.state} - {address.zipCode}
          </p>
          <p className="text-gray-400 mt-0.5">{address.phone}</p>
        </div>
        <div className="flex gap-3 shrink-0 ml-4">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:underline text-xs font-medium"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:underline text-xs font-medium"
          >
            Remove
          </button>
        </div>
      </div>
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h3 className="font-medium text-gray-900">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h3>

      <div className="flex gap-2">
        {["home", "work", "other"].map((type) => (
          <label key={type} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              value={type}
              {...register("type")}
              className="accent-blue-600"
            />
            <span className="text-xs capitalize text-gray-700">{type}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        placeholder="Landmark, apartment, etc."
        error={errors.addressLine2?.message}
        registration={register("addressLine2")}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="addr-city"
          label="City"
          placeholder="City"
          error={errors.city?.message}
          registration={register("city", { required: "Required" })}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">State</label>
          <select
            {...register("state", { required: "Required" })}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none
                    focus:ring-2 focus:ring-blue-500
                    ${errors.state ? "border-red-500" : "border-gray-300"}`}
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

      <div className="grid grid-cols-2 gap-3">
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

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register("isDefault")}
          className="accent-blue-600 w-4 h-4"
        />
        <span className="text-sm text-gray-700">Set as default address</span>
      </label>

      {serverError && (
        <div className="text-sm bg-red-50 text-red-600 px-3 py-2 rounded-lg">
          {serverError}
        </div>
      )}
      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Save changes" : "Add address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
