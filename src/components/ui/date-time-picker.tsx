"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Dropdown, MenuItem } from "./menu";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const HOURS12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const pad2 = (n: number) => String(n).padStart(2, "0");

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

interface Cell {
  y: number;
  m: number;
  d: number;
  muted: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  id,
  placeholder = "Pick date & time",
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
  id?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewY, setViewY] = useState(value?.getFullYear() ?? now.getFullYear());
  const [viewM, setViewM] = useState(value?.getMonth() ?? now.getMonth());

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target as HTMLElement | null)?.closest?.("[role='menu']")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const h24 = value ? value.getHours() : 9;
  const minute = value ? value.getMinutes() : 0;
  const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const compose = (day: Date | null, hour: number, min: number) => {
    const base = day ?? new Date();
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, min, 0, 0);
    onChange(d);
  };

  const cells = useMemo<Cell[]>(() => {
    const firstDow = (new Date(viewY, viewM, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const daysInPrev = new Date(viewY, viewM, 0).getDate();
    const out: Cell[] = [];
    for (let i = firstDow - 1; i >= 0; i--) {
      out.push({ y: viewY, m: viewM - 1, d: daysInPrev - i, muted: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ y: viewY, m: viewM, d, muted: false });
    }
    while (out.length % 7 !== 0 || out.length < 35) {
      out.push({
        y: viewY,
        m: viewM + 1,
        d: out.length - (firstDow + daysInMonth) + 1,
        muted: true,
      });
    }
    return out;
  }, [viewY, viewM]);

  const stepMonth = (delta: number) => {
    const m = viewM + delta;
    if (m < 0) {
      setViewM(11);
      setViewY((y) => y - 1);
    } else if (m > 11) {
      setViewM(0);
      setViewY((y) => y + 1);
    } else {
      setViewM(m);
    }
  };

  const years = Array.from({ length: 8 }, (_, i) => now.getFullYear() - 1 + i);

  return (
    <div ref={rootRef} data-datetime-picker className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm shadow-card transition-colors ${
          open ? "border-zinc-400 ring-2 ring-zinc-900/5" : "border-zinc-200 hover:border-zinc-300"
        }`}
      >
        <span className={value ? "truncate text-zinc-900" : "text-zinc-400"}>
          {value
            ? value.toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : placeholder}
        </span>
        <span className="ml-2 flex shrink-0 items-center gap-1.5">
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear expiry"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  onChange(null);
                }
              }}
              className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose expiry date and time"
          className="absolute left-0 z-40 mt-2 w-[320px] rounded-xl border border-zinc-200 bg-white p-3 shadow-[0_16px_44px_-10px_rgba(9,9,11,0.22)] animate-pop-in"
        >
          <div className="grid grid-cols-4 gap-1">
            {[
              ["+1 hr", 3600e3],
              ["+24 hrs", 86400e3],
              ["+7 days", 604800e3],
              ["+30 days", 2592000e3],
            ].map(([label, ms]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => onChange(roundTo5(Date.now() + (ms as number)))}
                className="rounded-md border border-zinc-200 px-1 py-[5px] text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                {label as string}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <ChevronBtn onClick={() => stepMonth(-1)} label="Previous month">
                <ChevronLeft className="h-3.5 w-3.5" />
              </ChevronBtn>
              <div className="flex items-center gap-0.5">
                <Dropdown
                  align="start"
                  width="w-36"
                  trigger={({ toggle, ref }) => (
                    <MenuBtn innerRef={ref} onClick={toggle}>
                      {MONTHS[viewM]}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </MenuBtn>
                  )}
                >
                  {MONTHS.map((m, i) => (
                    <MenuItem
                      key={m}
                      icon={i === viewM ? <Check className="h-3.5 w-3.5" /> : undefined}
                      onSelect={() => setViewM(i)}
                    >
                      {m}
                    </MenuItem>
                  ))}
                </Dropdown>
                <Dropdown
                  align="start"
                  width="w-28"
                  trigger={({ toggle, ref }) => (
                    <MenuBtn innerRef={ref} onClick={toggle}>
                      {viewY}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </MenuBtn>
                  )}
                >
                  {years.map((y) => (
                    <MenuItem
                      key={y}
                      icon={y === viewY ? <Check className="h-3.5 w-3.5" /> : undefined}
                      onSelect={() => setViewY(y)}
                    >
                      {y}
                    </MenuItem>
                  ))}
                </Dropdown>
              </div>
              <ChevronBtn onClick={() => stepMonth(1)} label="Next month">
                <ChevronRight className="h-3.5 w-3.5" />
              </ChevronBtn>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-0.5">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">
                {w}
              </div>
            ))}
            {cells.map((c, i) => {
              const date = new Date(c.y, c.m, c.d);
              const disabled = date < startOfToday();
              const selected = value ? sameDay(date, value) : false;
              const today = sameDay(date, now);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (c.muted) {
                      setViewM(c.m);
                      setViewY(c.y);
                    }
                    compose(new Date(c.y, c.m, c.d), h24, minute);
                  }}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[12.5px] font-medium tabular transition-colors ${
                    disabled
                      ? "cursor-not-allowed text-zinc-300"
                      : selected
                        ? "bg-accent text-white hover:bg-indigo-700"
                        : c.muted
                          ? "text-zinc-300 hover:bg-zinc-100"
                          : "text-zinc-700 hover:bg-zinc-100"
                  } ${today && !selected ? "ring-1 ring-inset ring-zinc-300" : ""}`}
                >
                  {c.d}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-1 border-t border-zinc-100 pt-2.5">
            <Dropdown
              align="start"
              width="w-24"
              trigger={({ toggle, ref }) => (
                <MenuBtn innerRef={ref} onClick={toggle} boxed>
                  {pad2(hour12)}
                </MenuBtn>
              )}
            >
              {HOURS12.map((h) => {
                const val = (h % 12) + (ampm === "PM" ? 12 : 0);
                return (
                  <MenuItem
                    key={h}
                    icon={h === hour12 ? <Check className="h-3.5 w-3.5" /> : undefined}
                    onSelect={() => compose(value, val, minute)}
                  >
                    {pad2(h)}
                  </MenuItem>
                );
              })}
            </Dropdown>
            <span className="text-xs text-zinc-400">:</span>
            <Dropdown
              align="start"
              width="w-24"
              trigger={({ toggle, ref }) => (
                <MenuBtn innerRef={ref} onClick={toggle} boxed>
                  {pad2(minute)}
                </MenuBtn>
              )}
            >
              {MINUTES.map((m) => (
                <MenuItem
                  key={m}
                  icon={m === minute ? <Check className="h-3.5 w-3.5" /> : undefined}
                  onSelect={() => compose(value, h24, m)}
                >
                  {pad2(m)}
                </MenuItem>
              ))}
            </Dropdown>
            <div className="flex overflow-hidden rounded-lg border border-zinc-200">
              {(["AM", "PM"] as const).map((ap) => (
                <button
                  key={ap}
                  type="button"
                  onClick={() =>
                    compose(
                      value,
                      ap === "AM" ? h24 % 12 : (h24 % 12) + 12,
                      minute
                    )
                  }
                  className={`px-2 py-[5px] text-[11.5px] font-semibold transition-colors ${
                    ampm === ap
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {ap}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="ml-auto rounded-md px-2 py-[5px] text-[11.5px] font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              Never
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function roundTo5(ms: number) {
  const d = new Date(ms);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  return d;
}

function MenuBtn({
  innerRef,
  onClick,
  children,
  boxed,
}: {
  innerRef: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  children: React.ReactNode;
  boxed?: boolean;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md transition-colors ${boxed ? "min-w-[46px] justify-center border border-zinc-200 px-2 py-[5px] text-[12.5px] font-semibold tabular text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50" : "px-2 py-1 text-[13px] font-semibold text-zinc-800 hover:bg-zinc-100"}`}
    >
      {children}
    </button>
  );
}

function ChevronBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
    >
      {children}
    </button>
  );
}
