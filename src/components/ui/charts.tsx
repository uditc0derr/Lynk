"use client";

import { useMemo, useRef, useState } from "react";
import { formatShortDate } from "@/lib/format";

interface Point {
  date: string;
  count: number;
}

export function TrendChart({
  data,
  height = 220,
  color = "#4f46e5",
  secondary,
  secondaryColor = "#a1a1aa",
  labels = ["Clicks", "Scans"],
}: {
  data: Point[];
  height?: number;
  color?: string;
  secondary?: Point[];
  secondaryColor?: string;
  labels?: [string, string] | string[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const w = 720;
  const h = height;
  const padX = 8;
  const padTop = 14;
  const padBottom = 26;

  const series = useMemo(() => {
    const all = [...data.map((d) => d.count), ...(secondary ?? []).map((d) => d.count)];
    const max = Math.max(1, ...all);
    const niceMax = max <= 5 ? max : Math.ceil(max / 4) * 4;
    const step = (w - padX * 2) / Math.max(1, data.length - 1);
    const toPoints = (pts: Point[]) =>
      pts.map((p, i) => ({
        x: padX + i * step,
        y: padTop + (1 - p.count / niceMax) * (h - padTop - padBottom),
        ...p,
      }));
    return { primary: toPoints(data), sec: secondary ? toPoints(secondary) : null, niceMax };
  }, [data, secondary, h]);

  const linePath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const areaPath = (pts: { x: number; y: number }[]) =>
    `${linePath(pts)} L${pts[pts.length - 1].x.toFixed(1)} ${h - padBottom} L${pts[0].x.toFixed(1)} ${h - padBottom} Z`;

  const onMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.round((relX - padX) / ((w - padX * 2) / Math.max(1, data.length - 1)));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const hoveredPrimary = hover !== null ? series.primary[hover] : null;
  const gradId = `tc-${color.replace("#", "")}`;

  return (
    <div ref={wrapRef} className="relative w-full select-none" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" role="img" aria-label="Traffic over time">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={w - padX}
            y1={padTop + t * (h - padTop - padBottom)}
            y2={padTop + t * (h - padTop - padBottom)}
            stroke="#f4f4f5"
            strokeWidth="1"
          />
        ))}
        {series.sec && (
          <path d={linePath(series.sec)} fill="none" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="3 3" />
        )}
        <path d={areaPath(series.primary)} fill={`url(#${gradId})`} />
        <path d={linePath(series.primary)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hoveredPrimary && (
          <>
            <line x1={hoveredPrimary.x} x2={hoveredPrimary.x} y1={padTop} y2={h - padBottom} stroke="#e4e4e7" strokeWidth="1" />
            <circle cx={hoveredPrimary.x} cy={hoveredPrimary.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          </>
        )}
        {data.map((p, i) => {
          const showEvery = data.length > 60 ? 14 : data.length > 30 ? 7 : data.length > 10 ? 3 : 1;
          if (i % showEvery !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={p.date}
              x={series.primary[i].x}
              y={h - 8}
              textAnchor="middle"
              className="fill-zinc-400"
              fontSize="11"
            >
              {formatShortDate(p.date)}
            </text>
          );
        })}
      </svg>
      {hoveredPrimary && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-md"
          style={{
            left: `${(hoveredPrimary.x / w) * 100}%`,
            top: 0,
          }}
        >
          <div className="text-[11px] font-medium text-zinc-500">{formatShortDate(hoveredPrimary.date)}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px]">
            <span className="flex items-center gap-1 font-semibold tabular text-zinc-900">
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
              {hoveredPrimary.count}
            </span>
            {labels[0]}
            {series.sec && hover !== null && (
              <span className="flex items-center gap-1 font-semibold tabular text-zinc-600">
                <span className="h-[7px] w-[7px] rounded-full bg-zinc-300" />
                {series.sec[hover].count}
              </span>
            )}
            {series.sec && labels[1]}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "#18181b",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data);
  const step = width / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 6)).toFixed(1)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={pts[pts.length - 1]?.split(",")[0]} cy={pts[pts.length - 1]?.split(",")[1]} r="2" fill={color} />
    </svg>
  );
}

export function BarList({
  items,
  formatValue = (n: number) => String(n),
}: {
  items: { label: string; count: number; extra?: React.ReactNode }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-medium text-zinc-700">
              {item.extra}
              {item.label}
            </span>
            <span className="shrink-0 tabular text-[12.5px] text-zinc-500">
              {formatValue(item.count)}
            </span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-800 transition-all duration-300"
              style={{ width: `${Math.max(3, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
