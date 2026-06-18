"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function AddToCartButton({ productId, inStock }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null); // Response

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    setFeedback(null);

    const result = await addToCart(productId, quantity);

    if (result.success) {
      setFeedback({ type: "success", message: "Added to cart!" });
    } else {
      setFeedback({ type: "error", message: result.message });
    }

    setAdding(false);

    setTimeout(() => setFeedback(null), 3000);
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400
          font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Quantity:</span>
        <div className="flex- items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition text-lg leading-none"
          >
            -
          </button>
          <span className="px-4 py-2 text-sm font-medium border-x border-gray-300">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>
      <Button loading={adding} onClick={handleAddToCart}>
        Add to cart
      </Button>
      {feedback && (
        <div
          className={`text-sm text-center py-2 px3 rounded-lg
            ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
