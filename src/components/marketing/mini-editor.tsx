"use client";

import { useState } from "react";
import { QrPreview } from "@/components/qr/qr-preview";
import {
  DEFAULT_QR_CONFIG,
  type DotStyle,
  type QRStyleConfig,
} from "@/lib/qr/types";
import { Switch } from "@/components/ui/input";

const DOT_OPTIONS: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra" },
  { value: "dots", label: "Dots" },
  { value: "diamond", label: "Diamond" },
  { value: "classy", label: "Classy" },
];

const PRESETS: { name: string; patch: Pick<QRStyleConfig, "dotFill" | "cornerFill"> }[] = [
  {
    name: "Mono",
    patch: {
      dotFill: { type: "solid", color: "#18181b" },
      cornerFill: { type: "solid", color: "#18181b" },
    },
  },
  {
    name: "Iris",
    patch: {
      dotFill: {
        type: "linear",
        rotation: 45,
        stops: [
          { offset: 0, color: "#4f46e5" },
          { offset: 1, color: "#7c3aed" },
        ],
      },
      cornerFill: { type: "solid", color: "#4f46e5" },
    },
  },
  {
    name: "Ember",
    patch: {
      dotFill: {
        type: "linear",
        rotation: 90,
        stops: [
          { offset: 0, color: "#f97316" },
          { offset: 1, color: "#dc2626" },
        ],
      },
      cornerFill: { type: "solid", color: "#c2410c" },
    },
  },
  {
    name: "Forest",
    patch: {
      dotFill: { type: "radial", rotation: 0, stops: [
        { offset: 0, color: "#059669" },
        { offset: 1, color: "#065f46" },
      ] },
      cornerFill: { type: "solid", color: "#064e3b" },
    },
  },
];

const DEMO_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOCAyOCI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiByeD0iNiIgZmlsbD0iIzBmMTcyYSIvPjxwYXRoIGQ9Ik04IDE5TDE1IDEyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI4LjYiIGN5PSIxOC40IiByPSIyLjYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjIiLz48cmVjdCB4PSIxNyIgeT0iNyIgd2lkdGg9IjUiIGhlaWdodD0iNSIgcng9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

export function MiniEditor() {
  const [config, setConfig] = useState<QRStyleConfig>(() => ({
    ...DEFAULT_QR_CONFIG,
    dotStyle: "dots",
    dotFill: { type: "solid", color: "#18181b" },
    cornerFill: { type: "solid", color: "#18181b" },
  }));

  const patch = (p: Partial<QRStyleConfig>) =>
    setConfig((c) => ({ ...c, ...p }));

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-24px_rgba(9,9,11,0.18)]">
      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
              Style
            </p>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
              Live
            </span>
          </div>

          <p className="mb-2 mt-4 text-[13px] font-medium text-zinc-700">Module shape</p>
          <div className="grid grid-cols-3 gap-1.5">
            {DOT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patch({ dotStyle: opt.value })}
                className={`rounded-lg border px-2 py-[7px] text-[12px] font-medium transition-all duration-150 ${
                  config.dotStyle === opt.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-5 text-[13px] font-medium text-zinc-700">Palette</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => patch(preset.patch)}
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-[6px] text-[12px] font-medium transition-all duration-150 ${
                  JSON.stringify(config.dotFill) === JSON.stringify(preset.patch.dotFill)
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full ring-1 ring-black/10"
                  style={{
                    background:
                      preset.patch.dotFill.type === "solid"
                        ? preset.patch.dotFill.color
                        : `linear-gradient(135deg, ${preset.patch.dotFill.stops[0].color}, ${preset.patch.dotFill.stops[1].color})`,
                  }}
                />
                {preset.name}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2.5">
            <div>
              <p className="text-[13px] font-medium text-zinc-800">Center logo</p>
              <p className="text-xs text-zinc-400">Drop in your mark</p>
            </div>
            <Switch
              checked={config.logo.enabled}
              label="Toggle center logo"
              onChange={(v) =>
                patch({
                  logo: { ...config.logo, enabled: v, src: v ? DEMO_LOGO : "", shape: v ? "square" : "none" },
                })
              }
            />
          </div>
        </div>

        <div className="grid-paper flex items-center justify-center bg-zinc-50/40 p-8 sm:p-12">
          <div className="w-full max-w-[300px] rounded-xl border border-zinc-200 bg-white p-4 shadow-card transition-shadow duration-200 hover:shadow-[0_16px_44px_-16px_rgba(9,9,11,0.16)]">
            <QrPreview text="https://lynk.to/studio" config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
