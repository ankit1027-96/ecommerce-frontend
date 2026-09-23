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
        <div className="w-6 h-6 border-2 border-[#19324d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  const subtotal = cart?.totals?.subtotal || 0;
  const tax = cart?.totals?.tax || 0;
  const shipping = cart?.totals?.shipping || 0;
  const total = cart?.totals?.total || 0;
  const freeShippingThreshold = 500;

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 font-sans text-brand-dark">
      {/* Title & Top Summary */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-brand-border pb-6 mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-dark">
            Shopping Cart
          </h1>
          {hasItems && (
            <p className="text-sm text-brand-muted mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} currently
              reserved in your bag
            </p>
          )}
        </div>
        {hasItems && (
          <button
            onClick={clearCart}
            className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors focus:outline-none"
            type="button"
          >
            <svg
              className="w-3.5 h-3.5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Remove all items
          </button>
        )}
      </div>

      {!hasItems ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Items */}
          <div className="lg:col-span-7 space-y-6">
            {subtotal < freeShippingThreshold ? (
              <div className="px-4 py-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-800 text-xs sm:text-sm shadow-sm">
                <p className="font-medium">
                  Add{" "}
                  <span className="font-bold">
                    ₹
                    {(freeShippingThreshold - subtotal).toLocaleString(
                      "en-IN"
                    )}
                  </span>{" "}
                  more to get free shipping
                </p>
                <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#19324d] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (subtotal / freeShippingThreshold) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs sm:text-sm shadow-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="font-medium">
                  You qualify for{" "}
                  <span className="font-bold">Complimentary Standard Delivery</span>{" "}
                  on this order.
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
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-subtle space-y-6 sticky top-24">
              <h2 className="text-lg font-bold tracking-tight text-brand-dark pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-brand-muted font-medium">
                  <span>Subtotal</span>
                  <span className="text-brand-dark tabular-nums font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted font-medium">
                  <span>Estimated GST (18%)</span>
                  <span className="text-brand-dark tabular-nums font-semibold">
                    ₹{tax.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-brand-muted font-medium">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                      Free
                    </span>
                  ) : (
                    <span className="text-brand-dark tabular-nums font-semibold">
                      ₹{shipping.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-brand-border pt-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-brand-dark">
                      Total
                    </span>
                    <p className="text-[11px] text-brand-muted font-normal mt-0.5">
                      Inclusive of all duties &amp; taxes
                    </p>
                  </div>
                  <span className="text-2xl font-extrabold text-[#19324d] tabular-nums tracking-tight">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (!user) {
                      router.push("/login?next=/checkout");
                      return;
                    }
                    router.push("/checkout");
                  }}
                  className="w-full h-12 bg-[#19324d] text-white text-sm font-semibold rounded-xl tracking-wide shadow-md hover:bg-[#13263b] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                  type="button"
                >
                  <span>Proceed to Checkout</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>

                <div className="text-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center text-xs font-medium text-brand-muted hover:text-[#19324d] underline underline-offset-4 decoration-slate-300 hover:decoration-[#19324d] transition"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Bank-grade 256-bit encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Cart item card
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
      className={`bg-white border border-brand-border rounded-2xl p-5 sm:p-6 shadow-subtle hover:shadow-card transition duration-200 ${
        removing ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              sizes="112px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-grow space-y-1 w-full sm:w-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                {item.category || "Product"}
              </span>
              <Link
                href={`/products/${item.productId}`}
                className="block text-base font-bold text-brand-dark tracking-tight hover:text-[#19324d] line-clamp-2 leading-snug"
              >
                {item.name}
              </Link>
            </div>
            <span className="text-base font-bold text-brand-dark tabular-nums tracking-tight whitespace-nowrap">
              ₹{item.price?.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Stepper & Actions */}
          <div className="pt-4 flex items-center justify-between">
            <div className="inline-flex items-center bg-slate-50 border border-brand-border rounded-lg p-0.5 shadow-sm">
              <button
                aria-label="Decrease quantity"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-[#19324d] hover:shadow-xs transition disabled:opacity-40"
                type="button"
              >
                <span className="text-sm font-semibold">−</span>
              </button>
              <span className="w-8 text-center text-xs font-semibold text-brand-dark">
                {updating ? "..." : item.quantity}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={updating || item.quantity >= 10}
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-[#19324d] hover:shadow-xs transition disabled:opacity-40"
                type="button"
              >
                <span className="text-sm font-semibold">+</span>
              </button>
            </div>

            <button
              aria-label={`Remove ${item.name}`}
              onClick={handleRemove}
              disabled={removing}
              className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors py-1 px-2 rounded-md disabled:opacity-40"
              type="button"
            >
              <svg
                className="w-3.5 h-3.5 mr-1 text-inherit"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-brand-dark mb-2 tracking-tight">
        Your cart is empty
      </h2>
      <p className="text-brand-muted text-sm mb-6">
        Looks like you haven&apos;t added anything yet.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center h-11 px-6 bg-[#19324d] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#13263b] active:scale-[0.99] transition-all"
      >
        Start shopping
      </Link>
    </div>
  );
}
