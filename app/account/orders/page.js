"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        {orders.length} order{orders.length !== 1 ? "s" : ""}{" "}
      </p>

      {orders.map((order) => (
        <OrderRow key={order._id} order={order} />
      ))}
    </div>
  );
}

function OrderRow({ order }) {
  const statusStyle =
    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600";
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/account/orders/${order._id}`}>
      <div
        className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300
              hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
            <p className="font-mono text-sm text-gray-700">{order._id}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle}`}
          >
            {order.status}
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          {order.items?.slice(0, 2).map((item, i) => (
            <p key={i} className="text-sm text-gray-600 line-clamp-1">
              {item.name} × {item.quantity}
            </p>
          ))}
          {order.items?.length > 2 && (
            <p className="text-xs text-gray-400">
              +{order.items.length - 2} more item
              {order.items.length - 2 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{date}</span>
          <span className="font-bold text-gray-900">
            ₹
            {order.pricing?.total?.toLocaleString("en-IN") ||
              order.totalAmount?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
