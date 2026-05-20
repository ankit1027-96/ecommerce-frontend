export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        EKART
        <div className="texxt-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ekart</h1>
          <p className="text-grey-500 text-sm- mt-1">Your one-stop shop</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-grey-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
