"use client";

import AddToCartButton from "@/components/ui/AddToCart";

export default function ProductActions({ productId, inStock, maxQty }) {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Quantity
        </label>
        {/*
          AddToCartButton already renders its own quantity stepper and the
          "Add to cart" button together (confirmed from the screenshot),
          so it's rendered directly here with no wrapper stepper — adding
          one on top of it was producing two side-by-side steppers.
        */}
        <AddToCartButton productId={productId} inStock={inStock} />
      </div>
    </div>
  );
}
