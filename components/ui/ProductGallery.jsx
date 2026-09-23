"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  primaryImage,
  otherImages = [],
  productName,
  hasDiscount,
  discountPercent,
  isFeatured,
}) {
  const allImages = primaryImage ? [primaryImage, ...otherImages] : otherImages;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = allImages[activeIndex];

  return (
    <div className="flex flex-col space-y-4">
      {/* Main image */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3.8] flex items-center justify-center shadow-elevated border border-slate-800/20 group">
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#10b981] text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
              {discountPercent}% off
            </span>
          </div>
        )}
        {isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-black/50 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Featured</span>
            </span>
          </div>
        )}

        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || productName}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 0 && (
        <div className="flex items-center space-x-3 pt-1">
          {allImages.slice(0, 5).map((img, i) => (
            <button
              key={img._id || i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shadow-sm transition
                ${
                  i === activeIndex
                    ? "border-slate-900 ring-2 ring-slate-900/10"
                    : "border-transparent hover:border-slate-300"
                }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
          <div className="text-xs text-slate-400">
            <span>
              {activeIndex === 0 ? "Primary View" : `View ${activeIndex + 1}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
