import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  return (
    <Link href={`/products/${product._id}`} className="group block">
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden 
              hover:shadow-md hover:border-gray-300 transition-all duration-200"
      >
        <div className="relative aspect-square bg-gray-50">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width:1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828
                  0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {hasDiscount && (
            <div
              className="absolute top-2 left-2 bg-green-500 text-white text-xs
              font-medium px-2 py-0.5 rounded-full"
            >
              {discountPercent}% off
            </div>
          )}
          {product.inventory?.quantity === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">
                Out of stock
              </span>
            </div>
          )}{" "}
          {
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-0.5">
                {product.brand?.name}
              </p>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-base font-bold text-gray-900">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.comparePrice?.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </Link>
  );
}
