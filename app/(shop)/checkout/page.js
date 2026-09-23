"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { useRazorpay } from "@/lib/useRazorpay";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getAccessToken } from "@/lib/api";
const STEPS = ["Delivery Address", "Review Order", "Payment"];
const FREE_SHIPPING_THRESHOLD = 500;

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutFlow />
    </ProtectedRoute>
  );
}

function CheckoutFlow() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { openRazorpay } = useRazorpay();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);

  const items = cart?.items || [];
  const pricing = cart?.totals || {};

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const { data } = await api.get("/api/users/addresses");
        setAddresses(data.data || []);
        const defaultAddr = data.data?.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);
      } catch (err) {
        console.error("Failed to get addresses", err);
      } finally {
        setAddressesLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cart?.items?.length && !loading) {
      router.push("/cart");
    }
  }, [cart, loading, router]);

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    setError("");
    setLoading("true");
    setStep(2);
    try {
      const address = addresses.find((a) => a._id === selectedAddress);

      const { data: orderData } = await api.post("/api/orders", {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
        paymentMethod,
      });
      console.log("STEP 1 - ORDER RESPONSE:", orderData);

      const orderId = orderData.data._id || orderData.data.orderId;

      console.log("STEP 2 - ORDER ID:", orderId);

      const { data: paymentData } = await api.post("/api/payments/initiate", {
        orderId,
        gateway: paymentMethod === "razorpay" ? "razorpay" : "cod",
      });

      console.log("STEP 3 - PAYMENT RESPONSE:", paymentData);

      if (paymentMethod === "cod") {
        await clearCart();
        router.push(`/order-success?orderId=${orderId}`);
      }

      openRazorpay({
        amount: paymentData.data.amount,
        currency: paymentData.data.currency || "INR",
        razorapayOrderId: paymentData.data.razorpayOrderId,
        keyId: paymentData.data.razorpayKeyId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        onSuccess: async (razorpayResponse) => {
          await api.post("/api/payments/verify/razorpay", {
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
            orderId,
          });
          await clearCart();
          router.push(`/order-success?orderId=${orderId}`);
        },
        onFailure: (message) => {
          setError(message || "Payment failed. Please try again.");
          setStep(1);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setStep(1);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-10 font-sans text-slate-900">
      {/* Title & Stepper */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">
          Checkout
        </h1>
        <StepIndicator currentStep={step} steps={STEPS} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          {step === 0 && (
            <AddressStep
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
              loading={addressesLoading}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onNext={() => {
                if (!selectedAddress) {
                  setError("Please select a delivery address");
                  return;
                }
                setError("");
                setStep(1);
              }}
              error={error}
            />
          )}
          {step === 1 && (
            <ReviewStep
              items={items}
              address={addresses.find((a) => a._id === selectedAddress)}
              paymentMethod={paymentMethod}
              onBack={() => setStep(0)}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
              error={error}
            />
          )}

          {step === 2 && <ProcessingStep />}
        </div>

        <div className="lg:col-span-5">
          <OrderSummary items={items} pricing={pricing} />
        </div>
      </div>
    </main>
  );
}

// Sub Components

function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center space-x-3 text-sm font-medium">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 text-sm
                      ${i <= currentStep ? "text-blue-600" : "text-slate-400"}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center
                         text-xs font-bold shrink-0
                         ${
                           i < currentStep
                             ? "bg-blue-600 text-white"
                             : i === currentStep
                               ? "border-2 border-blue-600 text-blue-600 bg-white"
                               : "border border-slate-300 text-slate-400 bg-white"
                         }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </span>
            <span
              className={`hidden sm:block ${
                i === currentStep ? "font-semibold text-slate-900" : ""
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-[1px] ${
                i < currentStep ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AddressStep({
  addresses,
  selectedAddress,
  onSelect,
  loading,
  paymentMethod,
  onPaymentMethodChange,
  onNext,
  error,
}) {
  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Loading addresses...
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      {/* Delivery Address */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Select delivery address
          </h2>
          <Link
            href="/account"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            + Add new address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            You have no saved addresses.{" "}
            <Link href="/account" className="font-medium underline">
              Add one in account
            </Link>{" "}
            before checking out.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((address) => {
              const selected = selectedAddress === address._id;
              return (
                <button
                  key={address._id}
                  onClick={() => onSelect(address._id)}
                  type="button"
                  className={`relative w-full text-left bg-white rounded-xl p-5 transition-all
                   ${
                     selected
                       ? "border-2 border-blue-600 shadow-xs"
                       : "border border-slate-200 hover:border-slate-300"
                   }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {address.firstName} {address.lastName}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                            Default
                          </span>
                        )}
                        {address.type && (
                          <span className="text-xs text-slate-400 capitalize">
                            {address.type}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed pt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                        <br />
                        {address.city}, {address.state} - {address.zipCode}
                        <br />
                        Phone: {address.phone}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0
                        ${selected ? "border-blue-600" : "border-slate-300"}`}
                    >
                      {selected && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Payment Method */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Payment method
        </h2>
        <div className="space-y-3">
          {[
            {
              value: "razorpay",
              label: "Pay Online",
              desc: "UPI, Cards, Net Banking via Razorpay",
            },
            {
              value: "cod",
              label: "Cash on Delivery",
              desc: "Pay on delivery",
            },
          ].map((method) => {
            const selected = paymentMethod === method.value;
            return (
              <label key={method.value} className="block cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value={method.value}
                  checked={selected}
                  onChange={() => onPaymentMethodChange(method.value)}
                  className="sr-only"
                />
                <div
                  className={`p-5 rounded-xl flex items-center justify-between transition-colors
                    ${
                      selected
                        ? "bg-blue-50/40 border-2 border-blue-600 shadow-xs"
                        : "bg-white border border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm text-slate-900">
                      {method.label}
                    </div>
                    <div className="text-xs text-slate-500">{method.desc}</div>
                  </div>
                  {selected ? (
                    <div className="w-9 h-5 bg-blue-600 rounded-full relative p-0.5 flex items-center justify-end">
                      <div className="w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={addresses.length === 0}
        type="button"
        className="w-full bg-[#19324d] hover:bg-[#13263b] text-white py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Continue to Review</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M14 5l7 7m0 0l-7 7m7-7H3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-800">
            Authentic Guarantee
          </div>
          <div className="text-[11px] text-slate-500">100% Verified Goods</div>
        </div>
        <div className="space-y-1 border-x border-slate-100">
          <div className="text-xs font-semibold text-slate-800">
            Express Delivery
          </div>
          <div className="text-[11px] text-slate-500">Ships within 24h</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-800">
            Simple Returns
          </div>
          <div className="text-[11px] text-slate-500">30-day return window</div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  items,
  address,
  paymentMethod,
  onBack,
  onPlaceOrder,
  loading,
  error,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Delivering to
        </h2>
        {address && (
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">
              {address.firstName} {address.lastName}
            </p>
            <p className="mt-0.5">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </p>
            <p>
              {address.city}, {address.state} - {address.zipCode}
            </p>
            <p className="mt-0.5 text-slate-500">{address.phone}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Items ({items.length})
        </h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-4 py-3"
            >
              <span className="text-slate-700 line-clamp-1 flex-1 mr-4">
                {item.name} x {item.quantity}
              </span>
              <span className="font-semibold text-slate-900 shrink-0">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600">
        <span className="font-medium text-slate-900">Payment: </span>
        {paymentMethod === "razorpay"
          ? "Online Payment (Razorpay)"
          : "Cash on delivery"}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          type="button"
          className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-700
         font-semibold text-sm hover:bg-slate-50 transition"
        >
          Back
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={loading}
          type="button"
          className="flex-1 bg-[#19324d] hover:bg-[#13263b] text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-60"
        >
          {loading ? "Processing" : "Place Order"}
        </button>
      </div>
    </div>
  );
}

function ProcessingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="font-semibold text-slate-900 mb-1">
        Processing your order
      </h2>
      <p className="text-sm text-slate-500">Please don&apos;t close this tab</p>
    </div>
  );
}

function OrderSummary({ items, pricing }) {
  const subtotal = pricing.subtotal || 0;
  const tax = pricing.tax || 0;
  const shipping = pricing.shipping || 0;
  const total = pricing.total || 0;
  const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || shipping === 0;

  return (
    <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl p-6 lg:p-7 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Order summary</h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Items */}
      <div className="py-4 border-b border-slate-100 space-y-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex gap-3 min-w-0">
              <div className="relative w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain mix-blend-multiply p-1.5"
                    sizes="64px"
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-slate-300"
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
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Qty: {item.quantity}
                  {item.color && ` • Color: ${item.color}`}
                </p>
                {item.size && (
                  <p className="text-xs text-slate-500">Size: {item.size}</p>
                )}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="py-4 space-y-3 text-sm text-slate-600 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span>Estimated GST (18%)</span>
              <span
                className="text-slate-400 text-xs"
                title="18% Goods and Services Tax"
              >
                ⓘ
              </span>
            </div>
            <span className="font-medium text-slate-900">
              ₹{tax.toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="font-semibold text-emerald-600">FREE</span>
          ) : (
            <span className="font-medium text-slate-900">
              ₹{shipping.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-5 pb-6">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-base font-bold text-slate-900">Total</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inclusive of all duties &amp; taxes
            </p>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{total.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Free delivery notice */}
      {qualifiesFreeShipping && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-emerald-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span>
            You qualify for{" "}
            <strong>Complimentary Standard Delivery</strong> on this order.
          </span>
        </div>
      )}

      {/* Security reassurance */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
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
  );
}
