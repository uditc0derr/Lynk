import { forwardRef } from "react";

const base =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-card placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={`${base} h-9 ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${base} min-h-[76px] py-2 leading-relaxed ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", ...props }, ref) => (
  <select
    ref={ref}
    className={`${base} h-9 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.65rem_center] bg-no-repeat pr-9 ${className}`}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-zinc-700"
    >
      {children}
      {hint && <span className="text-xs font-normal text-zinc-400">{hint}</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] text-red-600">{message}</p>;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50 ${
        checked
          ? "border-zinc-900 bg-zinc-900"
          : "border-zinc-200 bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-sm transition-transform duration-150 ${
          checked ? "translate-x-[19px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
