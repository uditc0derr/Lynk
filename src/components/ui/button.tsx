import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "accent";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-zinc-800 active:bg-zinc-950 disabled:hover:bg-zinc-900",
  secondary:
    "border border-zinc-200 bg-white text-zinc-800 shadow-card hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200/70",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  "danger-ghost":
    "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100",
  accent: "bg-accent text-white hover:bg-accent-hover active:bg-indigo-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
  "icon-sm": "h-8 w-8 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
