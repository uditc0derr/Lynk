"use client";

import { Segmented } from "@/components/ui/primitives";
import type { Fill } from "@/lib/qr/types";

function hexToHex6(hex: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const short = /^#([0-9a-fA-F])$/.exec(hex);
  if (short) return `#${short[1]}${short[1]}${short[1]}${short[1]}${short[1]}${short[1]}`;
  return "#000000";
}

export function ColorField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-card">
      <span className="relative ml-1 block h-7 w-7 shrink-0">
        <input
          type="color"
          value={hexToHex6(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label ?? "Pick color"}
          className="absolute inset-0 h-full w-full"
        />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v.startsWith("#") ? v : `#${v}`);
        }}
        aria-label={label ? `${label} hex` : "Hex color"}
        className="w-full bg-transparent px-2.5 font-mono text-[12.5px] uppercase text-zinc-700 outline-none"
      />
    </div>
  );
}

export function FillPicker({
  value,
  onChange,
  label,
}: {
  value: Fill;
  onChange: (f: Fill) => void;
  label: string;
}) {
  const isGradient = value.type !== "solid";
  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-zinc-700">{label}</p>
        <Segmented
          value={value.type === "solid" ? "solid" : value.type}
          onChange={(t) => {
            if (t === "solid") {
              onChange({
                type: "solid",
                color:
                  value.type === "solid" ? value.color : value.stops[0].color,
              });
            } else {
              onChange({
                type: t,
                rotation: value.type !== "solid" ? value.rotation : 45,
                stops:
                  value.type !== "solid"
                    ? value.stops
                    : [
                        { offset: 0, color: value.color },
                        { offset: 1, color: "#4f46e5" },
                      ],
              });
            }
          }}
          options={[
            { value: "solid", label: "Solid" },
            { value: "linear", label: "Linear" },
            { value: "radial", label: "Radial" },
          ]}
        />
      </div>
      {isGradient ? (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <ColorField
              label={`${label} start color`}
              value={value.stops[0].color}
              onChange={(c) =>
                onChange({ ...value, stops: [{ ...value.stops[0], color: c }, value.stops[1]] })
              }
            />
            <ColorField
              label={`${label} end color`}
              value={value.stops[1].color}
              onChange={(c) =>
                onChange({ ...value, stops: [value.stops[0], { ...value.stops[1], color: c }] })
              }
            />
          </div>
          <div
            className="h-5 rounded-full ring-1 ring-black/10"
            style={{
              background:
                value.type === "linear"
                  ? `linear-gradient(90deg, ${value.stops[0].color}, ${value.stops[1].color})`
                  : `radial-gradient(circle, ${value.stops[0].color}, ${value.stops[1].color})`,
            }}
          />
          {value.type === "linear" && (
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-zinc-500">
                Angle
                <span className="tabular">{Math.round(value.rotation)}°</span>
              </span>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={value.rotation}
                onChange={(e) =>
                  onChange({ ...value, rotation: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <ColorField
            label={`${label} color`}
            value={value.color}
            onChange={(c) => onChange({ ...value, color: c })}
          />
        </div>
      )}
    </div>
  );
}
