"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const navItems = [
  {
    href: "/account",
    label: "Profile & Addresses",
    icon: (
      <path
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    ),
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: (
      <path
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    ),
  },
  {
    href: "/account/security",
    label: "Security & Password",
    icon: (
      <path
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    ),
  },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

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
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow font-sans">
        {/* Page Title & Subtitle */}
        <section className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            My Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information, delivery addresses, and account
            security preferences.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Nav */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/account"
                      ? pathname === "/account"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition
                        ${
                          isActive
                            ? "bg-blue-50/70 text-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          className={`w-4 h-4 ${
                            isActive ? "" : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {item.icon}
                        </svg>
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition text-left"
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Nav */}
          <div className="lg:hidden col-span-1 mb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/account"
                    ? pathname === "/account"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 bg-gray-100"
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                type="button"
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Right Content Dashboard */}
          <section className="lg:col-span-9 space-y-8 min-w-0">
            {children}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
