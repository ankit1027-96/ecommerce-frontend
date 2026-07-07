"use client";

import { useEffect, useRef, useState } from "react";

export function useRazorpay() {
  const scriptLoaded = useRef(false);
  useEffect(() => {
    if (window.Razorpay || scriptLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };

    script.onerror = () => console.error("Razorpay SDK failed to load");
    document.body.appendChild(script);
  }, []);

  function openRazorpay({
    amount,
    currency,
    razorapayOrderId,
    keyId,
    userName,
    userEmail,
    onSuccess,
    onFailure,
  }) {
    if (!window.Razorpay) {
      alert("Payment system not ready. Please try again.");
      return;
    }

    const options = {
      key: keyId,
      amount: amount,
      currency: currency || "INR",
      order_id: razorapayOrderId,
      name: "ShopKart",
      description: "Order Payment",
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      theme: { color: "#2563EB" },
      handler: function (response) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          onFailure("Payment was cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      onFailure(response.error.discription || "Payment failed");
    });

    rzp.open();
  }

  return { openRazorpay };
}
