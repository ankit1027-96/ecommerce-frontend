"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="w-6 h-6 border-2 border-blue-600 border-t-transparent
                  rounded-full animate-spin"
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm mb-3">
          {error || "Order not found"}
        </p>
        <Link
          href="/account/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600 border-gray-200";
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/account/orders"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← Back to orders
          </Link>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${statusStyle}`}
          >
            {order.status}
          </span>
        </div>
        {/* Order data */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Order ID</p>
              <p className="font-mono text-gray-700 text-xs break-all">
                {order._id}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Placed on</p>
              <p className="text-gray-700">{date}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Payment</p>
              <p className="text-gray-700 capitalize">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>
          </div>
        </div>
        {/* Order progress */}
        {!isCancelled && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Order progress
            </h3>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div
                  key={step}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                          text-xs font-medium shrink-0
                          ${
                            i <= currentStep
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-xs text-gray-500 mt-1 capitalize text-center
                     w-16 leading-tight"
                    >
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-4 mx-1
                    ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">
            Items ({order.items?.length})
          </h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div
                  className="relative w-16 h-16 rounded-lg overflow-hidden
                bg-gray-50 shrink-0"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586
                        a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2
                        2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₹{item.price?.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                </div>

                <div className="text-sm font-bold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Pricing and Address by side */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Price Details
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.pricing?.subtotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{order.pricing?.tax?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.pricing?.shipped === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `₹${order.pricing?.shipping?.toLocaleString("en-IN")}`
                  )}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="flex justify-between font-bold text-gray-900 mb-3 text-sm">
                  Delivery Address
                </h3>
                {order.shippingAddress ? (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="mt-1">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} —{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No address info</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
