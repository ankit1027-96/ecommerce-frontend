"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSort(value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <select
      defaultValue={searchParams.get("sort") || ""}
      onChange={(e) => handleSort(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2 
      focus:outline-none
      focus-ring-2
      focus:ring-blue-500
      bg-white"
    >
      <option value="">Sort: Relevance</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
