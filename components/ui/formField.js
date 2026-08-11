import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  error,
  registration, // the object returned by register("fieldName", {...})
  className,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        {...registration}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
