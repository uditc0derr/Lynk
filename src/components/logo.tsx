export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5.5 22.5L15.5 12.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="6.4" cy="21.6" r="3.9" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="14.8" cy="13.2" r="2.6" fill="currentColor" />
      <rect
        x="18.6"
        y="3.1"
        width="6.3"
        height="6.3"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="h-[22px] w-[22px]" />
      <span className="text-[17px] font-semibold tracking-tight">LYNK</span>
    </span>
  );
}
