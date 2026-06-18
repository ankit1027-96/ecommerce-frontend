import Link from "next/link";

import ProductCard from "@/components/ui/ProductCard";
import CategorySidebar from "@/components/ui/CategorySidebar";
import ProductsFilter from "@/components/ui/ProductsFilter";

async function getProducts(searchParams) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "10");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
    { cache: "no-store" }, // cache categories for 1 hour because they rarely change
  );
  if (!res.ok) return { products: [], total: 0, page: 1, pages: 1 };
  const data = await res.json();
  return data.data;
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
    { next: { revalidate: 3600 } }, // cache categories for 1 hour - because they rarely change
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function ProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const [productsData, categories] = await Promise.all([
    getProducts(resolvedParams),
    getCategories(),
  ]);

  const { products = [], total = 0, page = 1, pages = 1 } = productsData;
console.log(productsData);

  return (
    <div className="flex gap-6">
      <aside className="hidden md:block w-56 shrink-0">
        <CategorySidebar categories={categories} />
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {total > 0 ? `${total} products found` : "No products found"}
          </p>
          <ProductsFilter />
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            {" "}
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
        {/* Pagination  */}
        {pages > 1 && <Pagination currentPage={page} totalPages={pages} />}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={`?page=${p}`}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition
            ${
              p === currentPage
                ? "bg-blue-600 text-white font-medium"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}
