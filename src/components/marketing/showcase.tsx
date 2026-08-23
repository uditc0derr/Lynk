"use client";

import { QrPreview } from "@/components/qr/qr-preview";
import type { QRStyleConfig } from "@/lib/qr/types";

const solid = (color: string) => ({ type: "solid" as const, color });
const linear = (
  rotation: number,
  a: string,
  b: string
): QRStyleConfig["dotFill"] => ({
  type: "linear",
  rotation,
  stops: [
    { offset: 0, color: a },
    { offset: 1, color: b },
  ],
});

const base = {
  background: { transparent: false, color: "#ffffff" },
  margin: 2,
  ecc: "M" as const,
  logo: {
    enabled: false,
    src: "",
    size: 22,
    padding: 4,
    shape: "none" as const,
    bgColor: "#ffffff",
  },
};

export const SHOWCASE_ITEMS: {
  text: string;
  config: QRStyleConfig;
  caption: string;
  sub: string;
}[] = [
  {
    text: "https://lynk.to/studio",
    config: {
      ...base,
      dotStyle: "dots",
      frameStyle: "extra-rounded",
      ballStyle: "dots",
      dotFill: solid("#18181b"),
      cornerFill: solid("#18181b"),
    },
    caption: "Dots",
    sub: "Soft modules, circle eyes",
  },
  {
    text: "https://lynk.to/studio",
    config: {
      ...base,
      dotStyle: "rounded",
      frameStyle: "leaf",
      ballStyle: "rounded",
      dotFill: linear(45, "#4f46e5", "#9333ea"),
      cornerFill: solid("#4f46e5"),
    },
    caption: "Gradient + leaf eyes",
    sub: "Linear indigo fade",
  },
  {
    text: "https://lynk.to/menu",
    config: {
      ...base,
      dotStyle: "diamond",
      frameStyle: "square",
      ballStyle: "diamond",
      dotFill: solid("#0f766e"),
      cornerFill: solid("#134e4a"),
    },
    caption: "Diamond",
    sub: "Geometric lattice",
  },
  {
    text: "https://lynk.to/card",
    config: {
      ...base,
      dotStyle: "classy-rounded",
      frameStyle: "rounded",
      ballStyle: "dots",
      dotFill: linear(90, "#ea580c", "#dc2626"),
      cornerFill: solid("#c2410c"),
    },
    caption: "Classy rounded",
    sub: "Warm radial energy",
  },
  {
    text: "https://lynk.to/event",
    config: {
      ...base,
      dotStyle: "extra-rounded",
      frameStyle: "dots",
      ballStyle: "square",
      dotFill: solid("#1e293b"),
      cornerFill: solid("#1e293b"),
      background: { transparent: true, color: "#ffffff" },
    },
    caption: "Transparent",
    sub: "Drops onto any surface",
  },
  {
    text: "https://lynk.to/brand",
    config: {
      ...base,
      dotStyle: "classy",
      frameStyle: "extra-rounded",
      ballStyle: "dots",
      dotFill: linear(120, "#0f172a", "#334155"),
      cornerFill: solid("#0f172a"),
      logo: {
        enabled: true,
        src:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOCAyOCI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiByeD0iNiIgZmlsbD0iIzBmMTcyYSIvPjxwYXRoIGQ9Ik04IDE5TDE1IDEyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI4LjYiIGN5PSIxOC40IiByPSIyLjYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjIiLz48cmVjdCB4PSIxNyIgeT0iNyIgd2lkdGg9IjUiIGhlaWdodD0iNSIgcng9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
        size: 24,
        padding: 5,
        shape: "square",
        bgColor: "#ffffff",
      },
    },
    caption: "With your logo",
    sub: "Center brand mark",
  },
];

export function QrShowcase() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
      {SHOWCASE_ITEMS.map((item, i) => (
        <figure
          key={i}
          className={`group rounded-xl border border-zinc-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_40px_-16px_rgba(9,9,11,0.18)] ${
            i === 1 ? "sm:translate-y-6" : ""
          } ${i === 4 ? "lg:translate-y-6" : ""}`}
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-zinc-100">
            <QrPreview text={item.text} config={item.config} animate={false} />
          </div>
          <figcaption className="mt-3">
            <p className="text-[13px] font-semibold text-zinc-900">{item.caption}</p>
            <p className="text-xs text-zinc-400">{item.sub}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
