import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <Image
              src="/Blogo.png"
              alt="SwiftCart logo"
              width={100}
              height={80}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              SwiftCart
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Your one-stop shop</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
