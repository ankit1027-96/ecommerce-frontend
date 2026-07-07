"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { useRazorpay } from "@/lib/useRazorpay";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const STEPS = ["Delivery Address", "Review Order", "Payment"];

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
  const pricing = cart?.pricing || {};

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const { data } = await api.get("/api/users/addresses");
        setAddresses(data.data || []);
        const defaultAddr = data.data?.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);
      } catch (error) {
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
      const address = addresses.find((a) => selectedAddress);

      const { data: orderData } = await api.post(",api/orders", {
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

      const orderId = orderData.data._id || orderData.data.orderId;

      const { data: paymentData } = await api.post("/api/payments/initiate", {
        orderId,
        gateway: paymentMethod === "razorpay" ? "razorpay" : "cod",
      });

      if (paymentMethod === "cod") {
        await clearCart();
        router.push(`/order-success?orderId=${orderId}`);
      }

      openRazorpay({
        amount: paymentData.data.amount,
        currency: paymentData.data.currency || "INR",
        razorapayOrderId: paymentData.data.razorpayOrderId,
        KeyId: paymentData.data.razorpayKeyId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        onSuccess: async (razorpayResponse) => {
          await api.post("/api/payments/verify/razorpay", {
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <StepIndicator currentStep={step} steps={STEPS} />

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          {step === 0 && (
            <AddressStep
              addresses={selectedAddress}
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
          {step === 2 && <ProcessingStep />}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary items={items} pricing={pricing} />
        </div>
      </div>
    </div>
  );
}

// Sub Components

function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 text-sm
                      ${i < currentStep ? "text-blue-600" : "text-gray-400"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center
                         text-xs font-medium shrink-0
                         ${
                           i < currentStep
                             ? "bg-blue-600 text-white"
                             : i === currentStep
                               ? "border-2 border-blue-600 text-blue-600"
                               : "border-2 border-gray-200 text-gray-400"
                         }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span className="hidden sm:block font-medium">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-1
                         ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
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
      <div className="text-center py-12 text-gray-400 text-sm">
        Loading addresses...
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-5">
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          Select delivery address
        </h2>

        {addresses.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            You have no saved addresses.{""}
            <a href="/account" className="font-medium underline">
              Add one in account
            </a>{" "}
            before checking out.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((address) => (
              <button
                key={address._id}
                onClick={() => onSelect(address._id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition
                   ${
                     selectedAddress === address._id
                       ? "border-blue-500 bg-blue-50"
                       : "border-gray-200 hover:border-gray-300 bg-white"
                   }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {address.firstName} {address.lastName}
                      </span>
                      {address.isDefault && (
                        <span
                          className="text-xs bg-blue-100 text-blue-700
                          px-2 py-0.5 rounded-full font-medium"
                        >
                          Default
                        </span>
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {address.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {address.phone}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center
                    ${
                      selectedAddress === address._id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAddress === address._id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/*Payment Method*/}

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Payment method</h2>
        <div className="flex flex-col gap-2">
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
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => onPaymentMethodChange(method.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition
              ${
                paymentMethod === method.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                </div>
                <div
                  className={`w-5 rounded-full border-2 shrink-0 flex items-center justify-center
                   ${
                     paymentMethod === method.value
                       ? "border-blue-500 bg-blue-500"
                       : "border-gray-300"
                   }`}
                >
                  {paymentMethod === method.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={addresses.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium
        hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Review
      </button>
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
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Delivering to</h2>
        {address && (
          <div className="bbg-gray-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-medium">
              {address.firstName} {address.lastName}
            </p>
            <p className="mt-0.5">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </p>
            <p>
              {address.city}, {address.state} - {address.zipCode}
            </p>
            <p className="mt-0.5 text-gray-500">{address.phone}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          Items ({items.length})
        </h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-3"
            >
              <span className="text-gray-700 line-clamp-1 flex-1 mr-4">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium text-gray-900 shrink-0">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
        <span className="font-medium text-gray-900">Payment: </span>
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
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700
         font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium
           hover:bg-blue-700 transition disabled:opacity-60"
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
      <div
        className="w-12 h-12 border-blue-600 border-t-transparent
   rounded-full animate-spin mb-4"
      />
      <h2 className="font-semibold text-gray-900 mb-1">
        Processing your order
      </h2>
      <p className="text-sm text-gray-500">Please don&apos;t close this tab</p>
    </div>
  );
}

function OrderSummary({ items, pricing }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
      <h3 className="font-semibold text-gray-900 mb-4">
        Order summary ({items.length} items)
      </h3>

      <div className="flex flex-col gap-1.5 mb-4 max-h-48 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between text-sm text-gray-600"
          >
            <span className="line-clamp-1 flex-1 mr-2">
              {item.name} x {item.quantity}
            </span>
            <span className="shrink-0">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{pricing.subtotal?.toLocaleString("en-IN") || 0}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {pricing.shipping === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              `₹${pricing.shipping?.toLocaleString("en-IN") || 0}`
            )}
          </span>
        </div>
        <div
          className="flex justify-between font-bold text-gray-900 text-base
          border-t border-gray-100 pt-2 mt-1"
        >
          <span>Total</span>
          <span>₹{pricing.total?.toLocaleString("en-IN") || 0}</span>
        </div>
      </div>
    </div>
  );
}
