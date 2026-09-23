import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductActions from "@/components/ui/ProductActions";

async function getProducts(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProducts(id);

  if (!product) notFound();

  const primaryImage =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  
  const otherImages = product.images?.filter((i) => !i.isPrimary) || [];
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;
  const inStock = product.inventory?.quantity > 0;
  const stockLeft = product.inventory?.quantity ?? 0;

  return (
    <div className="font-sans text-slate-800">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
        <Link href="/products" className="hover:text-slate-800 transition">
          Products
        </Link>
        <span>/</span>
        {product.category?.name && (
          <>
            <Link
              href={`/products?category=${product.category._id}`}
              className="hover:text-slate-800 transition"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-800 font-medium truncate">
          {product.name}
        </span>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-16">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            primaryImage={primaryImage}
            otherImages={otherImages}
            productName={product.name}
            hasDiscount={hasDiscount}
            discountPercent={discountPercent}
            isFeatured={product.isFeatured}
          />
        </div>

        {/* Details & purchase stack */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          {/* Brand & category */}
          <div className="flex items-center space-x-2 mb-1.5">
            {product.brand?.name && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {product.brand.name}
              </span>
            )}
            {product.shortDescription && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  {product.shortDescription}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Rating / reviews / views */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <div className="flex text-slate-300">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span className="text-slate-600 font-medium">
                {product.analytics?.reviewCount > 0
                  ? `${product.analytics.reviewCount} review${
                      product.analytics.reviewCount !== 1 ? "s" : ""
                    }`
                  : "No reviews yet"}
              </span>
            </div>
            {!product.analytics?.reviewCount && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium hover:text-slate-800 transition cursor-pointer underline underline-offset-2">
                  Be the first to review
                </span>
              </>
            )}
            {product.analytics?.views != null && (
              <>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center text-slate-500">
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                    <path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  {product.analytics.views} views
                </span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mt-6 pb-5 border-b border-slate-100">
            <div className="flex items-baseline space-x-3 flex-wrap gap-y-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.comparePrice?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    Save ₹
                    {(product.comparePrice - product.price).toLocaleString(
                      "en-IN",
                    )}{" "}
                    ({discountPercent}% off)
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center space-x-2 mt-3">
              <span className="relative flex h-2 w-2">
                {inStock && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    inStock ? "bg-emerald-500" : "bg-red-400"
                  }`}
                />
              </span>
              <span
                className={`text-xs font-medium ${
                  inStock ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {inStock ? `In stock (${stockLeft} left)` : "Out of stock"}
              </span>
              {inStock && (
                <span className="text-xs text-slate-400">
                  | Ready for dispatch
                </span>
              )}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <ProductActions
            productId={product._id}
            inStock={inStock}
            maxQty={stockLeft}
          />

          {/* Shipping / inventory box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                  />
                </svg>
                <span>Shipping Method</span>
              </span>
              <span className="text-slate-900 font-semibold capitalize">
                {product.shipping?.freeShipping
                  ? "Free Shipping"
                  : product.shipping?.shippingClass || "Standard Shipping"}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60 text-[11px]">
              <span>Inventory Status</span>
              <span
                className={`font-medium ${
                  inStock ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {inStock
                  ? `Tracked & Available (${stockLeft} units)`
                  : "Currently unavailable"}
              </span>
            </div>
          </div>

          {/* About this product */}
          {product.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                About this product
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {product.tags?.length > 0 && (
                <div className="mt-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guarantee badges */}
          <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-emerald-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>Verified Authentic Consignment</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-emerald-600 shrink-0"
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
              <span>Original Sealed Packaging</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
