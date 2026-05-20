export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition
            focus:ring-2 focus-ring-blue-500 focus:border-transparent
            ${error ? "border-red-500 bg-red-50" : "border-grey-300 bg-white"}
            `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
