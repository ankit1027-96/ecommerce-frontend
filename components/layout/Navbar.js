"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ShoppingCart, ChevronDown, Package, MapPin, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchWrapRef = useRef(null);

  // Debounced predictive search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/products", {
          params: { search: query, limit: 4 },
        });
        setResults(data.data?.products || data.data || []);
      } catch (err) {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit() {
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  }

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (err) {
      // Even if the API call fails, clear local state
    } finally {
      logout();
      router.push("/login");
    }
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        {/* Brand & Nav */}
        <div className="flex items-center space-x-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#19324d] rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              M
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Minimalist Goods
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search, Account, Cart */}
        <div className="flex items-center space-x-6">
          {/* Predictive Search */}
          <div
            ref={searchWrapRef}
            className="relative w-64 lg:w-80 hidden sm:block"
          >
            <div className="relative z-30">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                  searchOpen ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={query}
                placeholder="Search products..."
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                className={`w-full pl-10 pr-9 py-2 text-sm rounded-lg transition-all outline-none placeholder-slate-400 text-slate-900
                  ${
                    searchOpen
                      ? "border-2 border-blue-600 shadow-md ring-4 ring-blue-500/10 bg-white"
                      : "border border-slate-200 bg-slate-50"
                  }`}
              />
              {query && (
                <button
                  type="button"
                  title="Clear query"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Predictive Results Dropdown */}
            {searchOpen && query.trim() && (
              <div className="absolute right-0 top-12 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-3 overflow-hidden">
                {results.length > 0 ? (
                  <>
                    <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Product Matches ({results.length})
                    </div>
                    {results.map((item) => {
                      const thumb =
                        item.images?.find((img) => img.isPrimary)?.url ||
                        item.images?.[0]?.url;
                      const href = `/products/${item.slug}`;
                      return (
                      <Link
                        key={item._id}
                        href={href}
                        onClick={() => setSearchOpen(false)}
                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors border-l-2 border-transparent hover:border-blue-600"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center p-1 border border-slate-200 shrink-0">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={
                                  item.images?.find((img) => img.isPrimary)
                                    ?.altText ||
                                  item.images?.[0]?.altText ||
                                  item.name
                                }
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <span className="text-slate-400 text-[10px] font-bold">
                                {item.name?.slice(0, 3).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 leading-snug truncate">
                              {item.name}
                            </p>
                            {item.shortDescription && (
                              <p className="text-xs text-slate-500 truncate">
                                {item.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.price != null && (
                          <span className="text-xs font-semibold text-slate-900 shrink-0 ml-2">
                            ₹{item.price?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </Link>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    No products found for &quot;{query}&quot;
                  </div>
                )}
                <div className="my-2 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50"
                >
                  See all results for &quot;{query}&quot;
                </button>
              </div>
            )}
          </div>

          {/* Account Flyout */}
          {user ? (
            <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-2.5 py-1 px-2.5 rounded-lg border transition-colors ${
                    accountOpen
                      ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 hidden sm:inline-block">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-blue-700 transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
                {/* User metadata header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.email}
                  </p>
                  {user.emailVerified && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-medium text-emerald-700">
                        Verified Buyer
                      </span>
                    </div>
                  )}
                </div>

                <div className="py-1.5">
                  <Link
                    href="/account/orders"
                    className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-slate-400" />
                      Your Orders
                    </span>
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Saved Addresses
                  </Link>
                  <Link
                    href="/account/security"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Security &amp; Privacy
                  </Link>
                </div>

                <div className="border-t border-slate-100 my-1" />

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          )}

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            render={<Link href="/cart" />}
          >
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            {cartCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 justify-center rounded-full p-0 bg-[#19324d] hover:bg-[#19324d] text-[10px]">
                {cartCount > 9 ? "9+" : cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
