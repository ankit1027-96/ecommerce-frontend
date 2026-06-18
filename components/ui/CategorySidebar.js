"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CategorySidebar({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  function handleCategoryClick(categoryId) {
    const params = new URLSearchParams(searchParams);
    if (activeCategory === categoryId) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const topLevel = categories.filter((c) => !c.parentCategory);
  const subCategories = categories.filter((c) => c.parentCategory);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("category");
            router.push(`/products?${params.toString()}`);
          }}
          className={`text-left text-sm px-2 py-1.5 rounded-lg transition
                  ${
                    !activeCategory
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
        >
          All Products
        </button>
        {topLevel.map((cat) => (
          <div key={cat._id}>
            <button
              onClick={() => handleCategoryClick(cat._id)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition
                ${
                  activeCategory === cat._id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              {cat.name}
            </button>

            {/* Subcategories */}
            {subCategories
              .filter(
                (sub) =>
                  sub.parentCategory === cat._id ||
                  sub.parentCategory?._id === cat._id,
              )
              .map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => handleCategoryClick(sub._id)}
                  className={`w-full text-left text-sm pl-5 pr-2 py-1 rounded-lg transition
                    ${
                      activeCategory === sub._id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {sub.name}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
