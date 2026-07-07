"use-client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);

  use(() => {
    if (orderId) {
      api
        .get(`/api/orders/${orderId}`)
        .then(({ data }) => setOrder(data.data))
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div
        className="w-20 h-20 bg-green-100 rounded-full flex items-center
        justify-center mx-auto mb-6"
      >
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
      <p className="text-gray-500 mb-2">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      {orderId && (
        <p className="text-sm text-gray-400 mb-8">
          Order ID: <span className="font-mono text-gray-600">{orderId}</span>
        </p>
      )}

      {order && (
        <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Order Summary
          </h3>
          <div className="flex flex-col gap-2">
            {order.items?.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div
              className="border-t border-gray-200 pt-2 mt-1 flex justify-between
              font-bold text-gray-900 text-sm"
            >
              <span>Total</span>
              <span>₹{order.pricing?.total?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/orders"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl
            font-medium hover:bg-blue-700 transition text-sm"
        >
          View my orders
        </Link>
        <Link
          href="/products"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl
                font-medium hover:bg-gray-50 transition text-sm"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
