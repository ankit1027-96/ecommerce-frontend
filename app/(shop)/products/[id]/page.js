import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/ui/AddToCart";
import { notFound } from "next/navigation";

async function getProducts(id) {
  console.log("Hit");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = await res.json();
  console.log(data);

  return data.data;
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProducts(id);

  if (!product) notFound();

  const primaryImage =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const otherImages = product.images?.filter((i) => i.isPrimary) || [];
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;
  const inStock = product.inventory?.quantity > 0;

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/products" className="hover:text-gray-600">
          Products
        </Link>
        <span>/</span>
        {product.category?.name && (
          <>
            <Link
              href={`/products?category=${product.category._id}`}
              className="hover:text-gray-600"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg
                  className="w-16 h-16"
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
            {hasDiscount && (
              <div
                className="absolute top-3 left-3 bg-green-500 text-white
                 text-sm font-medium px-2.5 py-1 rounded-full"
              >
                {discountPercent}% off
              </div>
            )}
          </div>
          {otherImages.length > 0 && (
            <div className="flex gap-2">
              {otherImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-lg overflow-hidden
                  border border-gray-200"
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-gray-400 mb-1">{product.brand?.name}</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/*Price*/}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.comparePrice?.toLocaleString("en-IN")}
                </span>
                <span className="text-green-600 font-medium text-sm">
                  Save ₹
                  {(product.comparePrice - product.price).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </>
            )}
          </div>
          {/*Stock*/}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
            />
            <span
              className={`text-sm font-medium ${inStock ? "text-green-700" : "text-red-600"}`}
            >
              {inStock
                ? `In stock (${product.inventory.quantity} left)`
                : "Out of stock"}
            </span>
          </div>
          <AddToCartButton productId={product._id} inStock={inStock} />

          {/*Desc*/}
          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                About this product
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600
                  px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
