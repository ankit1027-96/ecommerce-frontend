"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const navItems = [
  { href: "/account", label: "Profile & Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/security", label: "Change Password" },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My account</h1>

        <div className="flex gap-8">
          <aside className="hidden md:block w-52 shrink-0">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/account"
                    ? pathname === "/account"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="md:hidden w-full mb-4">
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
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 bg-gray-100"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
