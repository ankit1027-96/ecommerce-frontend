import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Page not found
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        The page you&apos;re looking for doesn&apos;t exist
      </p>
      <Link
        href="/products"
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Go to shop
      </Link>
    </div>
  );
}
