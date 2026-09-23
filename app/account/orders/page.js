"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border border-purple-200",
  delivered: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

const FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "confirmed", label: "Confirmed" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
];

const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    api
      .get("/api/orders")
      .then(({ data }) => setOrders(data.data?.orders || data.data || []))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

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

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm mb-4">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/products"
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOrders.length;

  return (
    <section className="space-y-6">
      {/* Header: title + count + filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200/80 gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Orders History</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-medium">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setVisibleCount(PAGE_SIZE);
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap
                ${
                  filter === f.key
                    ? "bg-[#19324d] text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order cards */}
      {filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          No orders in this category.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination footer */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {visibleOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {filteredOrders.length}
            </span>{" "}
            total orders
          </p>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              type="button"
              className="px-3.5 py-1.5 bg-[#19324d] text-white rounded-lg font-semibold hover:bg-[#13263b] transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function OrderCard({ order }) {
  const statusStyle =
    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const total =
    order.pricing?.total?.toLocaleString("en-IN") ||
    order.totalAmount?.toLocaleString("en-IN");
  const items = order.items || [];
  const primaryItem = items[0];
  const extraCount = items.length - 1;

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition-all">
      {/* Header row */}
      <div className="bg-gray-50/75 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <div>
            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[11px]">
              Order ID
            </span>
            <span className="font-mono font-medium text-gray-700">
              {order._id}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[11px]">
              Date Placed
            </span>
            <span className="font-semibold text-gray-700">{date}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[11px]">
              Total Amount
            </span>
            <span className="font-bold text-gray-900">₹{total}</span>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyle}`}
        >
          {order.status}
        </span>
      </div>

      {/* Item + actions */}
      {primaryItem && (
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2 flex-shrink-0 border border-gray-100">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                {primaryItem.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Quantity: {primaryItem.quantity}
                {primaryItem.color && ` • Color: ${primaryItem.color}`}
                {primaryItem.size && ` • Size: ${primaryItem.size}`}
              </p>
              {extraCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  +{extraCount} more item{extraCount !== 1 ? "s" : ""}
                </p>
              )}
              <p className="text-sm font-semibold text-gray-700 mt-1">
                ₹{total}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
            {order.status === "pending" ? (
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            ) : order.status === "delivered" ? (
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Download Invoice
              </button>
            ) : (
              order.status !== "cancelled" && (
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Track Package
                </button>
              )
            )}
            <Link
              href={`/account/orders/${order._id}`}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#19324d] rounded-lg hover:bg-[#13263b] transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
