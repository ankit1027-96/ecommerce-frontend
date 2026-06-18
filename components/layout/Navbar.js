"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Image
          src="/Blogo.png"
          alt="SwiftCart logo"
          width={100}
          height={80}
          className="rounded-xl"
        />
        <Link href="/products" className="text-xl font-bold text-blue-600">
          ShopKart
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/products?search=${e.target.value}`);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
                m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs
                w-5 h-5 rounded-full flex items-center justify-center font-medium"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <div
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center
                  text-blue-700 font-medium text-sm"
                >
                  {user.firstName?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block">{user.firstName}</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200
                  rounded-xl shadow-lg py-1 z-50"
                >
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    My Orders
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
