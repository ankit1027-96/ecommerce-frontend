"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

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
          <Input
            type="text"
            placeholder="Search products..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/products?search=${e.target.value}`);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Cart button — Base UI Button uses `render`, not `asChild` */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            render={<Link href="/cart" />}
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 bg-blue-600 hover:bg-blue-600">
                {cartCount > 9 ? "9+" : cartCount}
              </Badge>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              {/* MenuPrimitive.Trigger already renders a <button>, so no render/asChild needed here */}
              <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-sm">
                    {user.firstName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block">{user.firstName}</span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href="/account" />}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/orders" />}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
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
        </div>
      </div>
    </nav>
  );
}
