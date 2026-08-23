"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

interface MenuContextValue {
  close: () => void;
}

const MenuContext = createContext<MenuContextValue>({ close: () => {} });

export function Dropdown({
  trigger,
  children,
  align = "end",
  width = "w-52",
}: {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    ref: React.Ref<HTMLButtonElement>;
  }) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuW = parseInt(width.replace("w-", ""), 10) * 4 || 208;
    let left =
      align === "end" ? rect.right - menuW : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    const menuH = menuRef.current?.offsetHeight ?? 240;
    let top = rect.bottom + 6;
    if (top + menuH > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuH - 6);
    }
    setPosition({ top, left });
  }, [align, width]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onClick = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => updatePosition();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, updatePosition]);

  return (
    <>
      {trigger({
        open,
        toggle: () => setOpen((v) => !v),
        ref: triggerRef,
      })}
      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <MenuContext.Provider value={{ close: () => setOpen(false) }}>
            <div
              ref={menuRef}
              role="menu"
              style={{ top: position.top, left: position.left }}
              className={`fixed z-50 ${width} origin-top rounded-xl border border-zinc-200 bg-white p-1 shadow-[0_12px_36px_-8px_rgba(9,9,11,0.18)] animate-pop-in`}
            >
              {children}
            </div>
          </MenuContext.Provider>,
          document.body
        )}
    </>
  );
}

export function MenuItem({
  children,
  onSelect,
  icon,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { close } = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        close();
        onSelect?.();
      }}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {icon && <span className="shrink-0 text-zinc-400">{icon}</span>}
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-zinc-100" role="separator" />;
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
      {children}
    </div>
  );
}

export function DropdownButton({
  open,
  toggle,
  ref,
  children,
  className = "",
}: {
  open: boolean;
  toggle: () => void;
  ref: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-haspopup="menu"
      aria-expanded={open}
      className={`inline-flex items-center justify-center gap-1.5 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  className = "",
}: {
  value: T | "";
  options: { value: T; label: string; description?: string }[];
  onChange: (v: T) => void;
  placeholder?: string;
  className?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Dropdown
      width="w-56"
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-card transition-colors hover:border-zinc-300 ${className}`}
        >
          <span className={current ? "text-zinc-900" : "text-zinc-400"}>
            {current?.label ?? placeholder ?? "Select"}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    >
      <MenuContext.Consumer>
        {({ close }) => (
          <div role="listbox">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-[7px] text-left text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <span className="font-medium">{opt.label}</span>
                {opt.value === value && (
                  <Check className="h-3.5 w-3.5 text-accent" />
                )}
              </button>
            ))}
          </div>
        )}
      </MenuContext.Consumer>
    </Dropdown>
  );
}

export function ActionButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-900"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}
