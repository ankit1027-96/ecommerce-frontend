export default function Button({
  children,
  loading,
  varient = "primary",
  ...props
}) {
  const base =
    "w-full py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      className={`${base} ${varient[varient]}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
