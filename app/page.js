import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import NewsletterForm from "@/components/ui/NewsletterForm";

/* ------------------------------------------------------------------ */
/*  Data fetching                                                      */
/* ------------------------------------------------------------------ */

async function getProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=8&sortBy=newest`,
    { cache: "no-store" },
  );
  if (!res.ok) return { products: [], pagination: { totalItems: 0 } };
  const data = await res.json();
  return data.data;
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

/* ------------------------------------------------------------------ */
/*  Home page                                                          */
/* ------------------------------------------------------------------ */

export default async function Home() {
  const [{ products = [], pagination = {} }, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const totalItems = pagination.totalItems ?? products.length;
  const featuredProduct =
    products.find((p) => p.isFeatured) || products[0] || null;
  const featuredImage =
    featuredProduct?.images?.find((i) => i.isPrimary) ||
    featuredProduct?.images?.[0];

  return (
    <div className="bg-[#fafbfc] text-slate-800 antialiased min-h-screen flex flex-col">
      {/* Top announcement banner */}
      <TopNotificationBanner />

      <main className="flex-grow">
        {/* -------------------------------------------------------- */}
        {/* Hero — Floating Glass Studio Capsule                      */}
        {/* -------------------------------------------------------- */}
        <section className="relative bg-[#f6f8fa] py-10 sm:py-14 lg:py-16 overflow-hidden border-b border-slate-200/90">
          {/* Airy fine technical dot-grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.45]"
            style={{
              backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Luminous atmospheric gradient */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-slate-200/50 via-slate-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Floating Translucent Studio Capsule */}
            <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-capsule p-8 sm:p-12 lg:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                {/* Copy */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Live pulse pill badge */}
                  <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-medium text-slate-700 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="tracking-wide text-slate-600 font-medium">
                      Curated Batch 2025 • Active Dispatch
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                    Objects of Enduring Restraint
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                    Architectural essentials engineered for the modern desk,
                    mobile workspace, and intentional living. Direct
                    manufacturer consignments of verified precision hardware.
                  </p>

                  {/* CTA Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 transition shadow-sm group"
                    >
                      <span>Explore Collection</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/products?sortBy=popularity"
                      className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium text-slate-600 hover:text-slate-950 transition group"
                    >
                      <span>View Lookbook &amp; Standards</span>
                      <span className="ml-1 text-slate-400 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>

                  {/* Embedded horizontal minimalist metrics strip */}
                  <div className="pt-8 mt-6 border-t border-slate-200/80 grid grid-cols-3 divide-x divide-slate-200/80 text-center">
                    <div className="px-2 sm:px-6">
                      <div className="flex items-center justify-center space-x-1.5 text-slate-500 mb-1">
                        <svg
                          className="w-3.5 h-3.5 text-slate-700"
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
                        <span className="font-display font-bold text-base sm:text-lg text-slate-950">
                          {totalItems}+
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 tracking-tight">
                        Curated Products
                      </div>
                    </div>
                    <div className="px-2 sm:px-6">
                      <div className="flex items-center justify-center space-x-1.5 text-slate-500 mb-1">
                        <svg
                          className="w-3.5 h-3.5 text-slate-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <span className="font-display font-bold text-base sm:text-lg text-slate-950">
                          24h
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 tracking-tight">
                        Dispatch Guarantee
                      </div>
                    </div>
                    <div className="px-2 sm:px-6">
                      <div className="flex items-center justify-center space-x-1.5 text-slate-500 mb-1">
                        <svg
                          className="w-3.5 h-3.5 text-slate-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <span className="font-display font-bold text-base sm:text-lg text-slate-950">
                          2-Year
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 tracking-tight">
                        Official Coverage
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured product showcase */}
                {featuredProduct && featuredImage && (
                  <div className="lg:col-span-5">
                    <Link
                      href={`/products/${featuredProduct._id}`}
                      className="group relative block rounded-2xl overflow-hidden border border-slate-200/90 shadow-float bg-slate-900 aspect-[4/5]"
                    >
                      <Image
                        src={featuredImage.url}
                        alt={featuredImage.altText || featuredProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {featuredProduct.brand?.name && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            {featuredProduct.brand.name}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-white mt-1">
                          {featuredProduct.name}
                        </h3>
                        <span className="text-base font-bold text-white mt-1 block">
                          ₹{featuredProduct.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Filter / Category strip                                   */}
        {/* -------------------------------------------------------- */}
        <nav
          id="catalog"
          className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-xs"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3.5 overflow-x-auto gap-4">
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href="/products"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-950 text-white transition shadow-xs"
                >
                  All Items{" "}
                  <span className="ml-1 text-[10px] text-slate-400 font-mono">
                    {totalItems}
                  </span>
                </Link>
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat._id}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 transition whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs text-slate-400 hidden md:inline">
                  Showing {products.length} architectural objects
                </span>
                <div className="relative inline-block text-left">
                  <Link
                    href="/products?sortBy=featured"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="text-slate-400">Sort by:</span>
                    <span className="font-semibold text-slate-900">
                      Featured
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* -------------------------------------------------------- */}
        {/* Product grid                                              */}
        {/* -------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Curated Inventory
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight mt-0.5">
                The Permanent Collection
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 hidden sm:block">
              Curated Batch 2025
            </span>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">
              No products available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* -------------------------------------------------------- */}
        {/* Brand Philosophy / Trust Pledge                           */}
        {/* -------------------------------------------------------- */}
        <section
          id="philosophy"
          className="bg-white border-y border-slate-200 py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Pledge of Integrity
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight mt-1">
                The Minimalist Standard
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Every piece curated by Minimalist Goods undergoes strict
                verification before being entered into active inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <TrustCard
                iconBg="bg-emerald-50 border-emerald-200 text-emerald-700"
                title="Authentic Consignment"
                desc="Direct manufacturer consignments with cryptographically verified serial numbers."
                icon={
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                }
              />
              <TrustCard
                title="Sealed Factory Packaging"
                desc="Pristine intact tamper seals. No open-box units unless explicitly stated in archive sales."
                icon={
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                }
              />
              <TrustCard
                title="2-Year Official Warranty"
                desc="Direct brand warranty supported by our internal executive replacement guarantee."
                icon={
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                }
              />
              <TrustCard
                title="Carbon Neutral Delivery"
                desc="100% offset ground and air express shipping with minimal recyclable unbleached packaging."
                icon={
                  <path
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                }
              />
            </div>
          </div>
        </section>

       
      </main>

      {/* -------------------------------------------------------- */}
      {/* Footer                                                    */}
      {/* -------------------------------------------------------- */}
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Local sub-components                                               */
/*  (move to /components when you want to reuse elsewhere)             */
/* ------------------------------------------------------------------ */

function TopNotificationBanner() {
  return (
    <aside
      data-purpose="top-announcement-bar"
      className="bg-slate-950 text-slate-300 text-xs py-2.5 px-4 border-b border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium">
            Complimentary insured express delivery across India on orders over
            ₹5,000
          </span>
        </div>
        <div className="flex items-center space-x-5 text-slate-400 text-[11px]">
          <a
            className="hover:text-white transition flex items-center gap-1"
            href="#concierge"
          >
            <span>Customer care</span>
          </a>
          <span className="text-slate-700">|</span>
          <a className="hover:text-white transition" href="#corporate">
            Corporate &amp; Consignment
          </a>
          <span className="text-slate-700">|</span>
        </div>
      </div>
    </aside>
  );
}

function TrustCard({
  title,
  desc,
  icon,
  iconBg = "bg-slate-100 border-slate-200 text-slate-800",
}) {
  return (
    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div
        className={`w-10 h-10 rounded-lg border flex items-center justify-center ${iconBg}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <h4 className="font-display font-semibold text-sm text-slate-950">
        {title}
      </h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer
      id="footer"
      data-purpose="site-footer"
      className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Manifest */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold text-base">
                M
              </div>
              <div>
                <span className="font-display font-bold text-base text-white tracking-tight">
                  Minimalist Goods
                </span>
                <span className="block text-[9px] font-semibold tracking-[0.2em] uppercase text-slate-400">
                  Architectural Essentials
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Curators of precision hardware, flagship communication devices,
              and high-performance lifestyle instruments. Designed with
              restraint, built for enduring performance.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              <span>
                Corporate Registered Office: Nariman Point, Mumbai 400021
              </span>
            </div>
          </div>

          {/* Hardware */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-200 block">
              Hardware
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link className="hover:text-white transition" href="/products">
                  Smartphones &amp; Tech
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/products">
                  Samsung Flagships
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/products">
                  Laptops &amp; Workstations
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/products">
                  Deskware &amp; Charging
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/products">
                  Footwear &amp; Apparel
                </Link>
              </li>
            </ul>
          </div>

          {/* Assurance */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-200 block">
              Assurance
            </span>
            <ul className="space-y-2.5">
              <li>
                <a className="hover:text-white transition" href="#">
                  Track Consignment
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Authentication Protocol
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Warranty Coverage
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Insured Transit
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Concierge Support
                </a>
              </li>
            </ul>
          </div>

          {/* Private Dispatch */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-200 block">
              Private Dispatch
            </span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Receive strictly confidential announcements on new hardware
              arrivals and archive drops.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            © 2025 Minimalist Goods Co. All rights reserved. Architectural
            essentials and flagship tech consignments.
          </div>
          <div className="flex items-center space-x-6">
            <a className="hover:text-slate-300 transition" href="#">
              Terms of Sale
            </a>
            <a className="hover:text-slate-300 transition" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-slate-300 transition" href="#">
              Security Protocol
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
