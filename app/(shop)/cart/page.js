"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, cartLoading, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  const subtotal = cart?.pricing?.subtotal || 0;
  const tax = cart?.pricing?.tax || 0;
  const shipping = cart?.pricing?.shipping || 0;
  const total = cart?.pricing?.total || 0;
  const freeShippingThreshold = 500;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Cart{" "}
        {hasItems &&
          `(${items.length} ${items.length === 1 ? "item " : "items"})`}
      </h1>

      {!hasItems ? (
        <EmptyCart />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {subtotal < freeShippingThreshold && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-700">
                Add{" "}
                <span className="font-semibold">
                  ₹{(freeShippingThreshold - subtotal).toLocaleString("en-IN")}
                </span>{" "}
                more to get free shipping
              </p>
              <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
          {subtotal >= freeShippingThreshold && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <p className="text-sm text-green-700 font-medium">
                You qualify for free shipping
              </p>
            </div>
          )}

          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}

          {/*Clear cart*/}
          <button
            onClick={clearCart}
            className="self-start text-sm text-red-500 hover:text-red-700 hover:underline"
          >
            Remove all items
          </button>

          {/*Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₹${shipping.toLocaleString("en-IN")}`
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-100 my-1" />

                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    router.push("/login?next=/checkout");
                    return;
                  }
                  router.push("/checkout");
                }}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl
                  font-medium hover:bg-blue-700 transition"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="block text-center text-sm text-gray-500 hover:text-gray-700
                  mt-3 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Cart item row
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleQuantityChange(newQty) {
    if (newQty < 1) return;
    setUpdating(true);
    await onUpdateQuantity(item.productId, newQty);
    setUpdating(false);
  }

  async function handleRemove() {
    setRemoving(true);
    await onRemove(item.productId);
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 flex gap-4 
       transition ${removing ? "opacity-50" : ""}`}
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586
                a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6
                a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.productId}`}
          className="text-sm font-medium text-gray-900 hoverLtext-blue-600 
          line-clamp-2 leading-snug"
        >
          {item.name}
        </Link>
        <p className="text-sm font-bold text-gray-900 mt-1">
          ₹{item.price?.toLocaleString("en-IN")}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-50
                disabled:opacity-40 transition text-lg leading-none"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">
              {updating ? "..." : item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating || item.quantity >= 10}
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-50
                disabled:opacity-40 transition text-lg leading-none"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-sm text-red-500 hover:text-red-700 hover:underline
              disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 bg-gray-100 rounded-full flex items-center
        justify-center mx-auto mb-4"
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184
            1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Looks like you haven&apos;t added anything yet.
      </p>
      <Link
        href="/products"
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl
          text-sm font-medium hover:bg-blue-700 transition"
      >
        Start shopping
      </Link>
    </div>
  );
}
