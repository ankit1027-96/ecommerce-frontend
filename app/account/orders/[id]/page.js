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
  pending: "bg-amber-50 text-amber-700 border-amber-200",
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
    STATUS_STYLES[order.status] ||
    "bg-gray-100 text-gray-600 border-gray-200";
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const placedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const shortDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const paymentLabel =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";
  const isPaid = order.paymentMethod !== "cod";

  return (
    <section className="space-y-6">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Back to My Orders
        </Link>
      </div>

      {/* Meta header card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                Order #{order._id}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${statusStyle}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {placedDate} at {placedTime}
            </p>
          </div>

          {!isCancelled && (
            <div className="flex items-center gap-3">
              {order.status === "delivered" && (
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Download Invoice
                </button>
              )}
              {order.status === "pending" && (
                <button
                  type="button"
                  className="px-4 py-2 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Order ID
            </p>
            <p
              className="mt-1 font-mono text-xs text-slate-700 truncate"
              title={order._id}
            >
              {order._id}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Date Placed
            </p>
            <p className="mt-1 text-slate-800 font-medium">{shortDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Payment Method
            </p>
            <p className="mt-1 text-slate-800 font-medium">{paymentLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Amount
            </p>
            <p className="mt-1 font-bold text-slate-900">
              ₹{order.pricing?.total?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Order progress */}
      {!isCancelled && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-slate-900">
              Order Progress
            </h3>
            {order.estimatedDelivery && (
              <span className="text-xs text-slate-500 font-medium">
                Estimated Delivery:{" "}
                <strong className="text-slate-800">
                  {order.estimatedDelivery}
                </strong>
              </span>
            )}
          </div>

          <div className="relative px-2">
            <div className="flex items-center justify-between relative z-10">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                        ${
                          i < currentStep
                            ? "bg-[#19324d] text-white shadow-sm"
                            : i === currentStep
                              ? "bg-[#19324d] text-white shadow-sm ring-4 ring-blue-100"
                              : "bg-slate-100 text-slate-400 border border-slate-200 font-semibold"
                        }`}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span
                      className={`mt-3 text-xs text-center capitalize ${
                        i === currentStep
                          ? "font-bold text-[#19324d]"
                          : "font-medium text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block">
                      {i === currentStep ? `${shortDate}, ${placedTime}` : "\u00A0"}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-full flex-1 h-0.5 -mt-6 ${
                        i < currentStep ? "bg-[#19324d]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Items ({order.items?.length || 0})
          </h3>
          {order.deliveryType && (
            <span className="text-xs text-slate-500 font-medium">
              {order.deliveryType}
            </span>
          )}
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {order.items?.map((item, i) => (
            <div
              key={i}
              className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 first:pt-5 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 line-clamp-2">
                    {item.name}
                  </h4>
                  {(item.color || item.variant) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {item.color && `Color: ${item.color}`}
                      {item.color && item.variant && (
                        <span className="mx-1.5">•</span>
                      )}
                      {item.variant}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-slate-400">
                      Unit: ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-base font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#19324d] hover:underline mt-1"
                >
                  Need Help?
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery address + Payment summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Delivery Address
              </h3>
              {order.shippingAddress?.type && (
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                  {order.shippingAddress.type}
                </span>
              )}
            </div>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-bold text-slate-900 text-base">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="mt-2 text-slate-700">
                  {order.shippingAddress.addressLine1}
                </p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-slate-700">
                    {order.shippingAddress.addressLine2}
                  </p>
                )}
                <p className="text-slate-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  — {order.shippingAddress.zipCode}
                </p>
                <p className="text-slate-500 pt-1">
                  {order.shippingAddress.country || "India"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No address info</p>
            )}
          </div>
          {order.shippingAddress?.phone && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                />
              </svg>
              <span>{order.shippingAddress.phone}</span>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Payment Summary
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isPaid ? "Paid" : "Pay on Delivery"}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-slate-900">
                ₹{order.pricing?.subtotal?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span className="font-medium text-slate-900">
                ₹{order.pricing?.tax?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping &amp; Handling</span>
              <span>
                {order.pricing?.shipping === 0 ? (
                  <span className="font-medium text-emerald-600">Free</span>
                ) : (
                  <span className="font-medium text-slate-900">
                    ₹{order.pricing?.shipping?.toLocaleString("en-IN")}
                  </span>
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">
                  Total Paid
                </span>
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{order.pricing?.total?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {isPaid && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#19324d]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                    />
                  </svg>
                  <span>Paid via {order.paymentGateway || "Razorpay"}</span>
                </div>
                {order.paymentId && (
                  <span className="text-slate-400 font-mono">
                    TXN#{order.paymentId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
