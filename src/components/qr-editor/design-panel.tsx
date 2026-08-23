"use client";

import {
  BALL_STYLES,
  DOT_STYLES,
  FRAME_STYLES,
  type CornerBallStyle,
  type CornerFrameStyle,
  type DotStyle,
  type Fill,
  type QRStyleConfig,
} from "@/lib/qr/types";
import { Switch } from "@/components/ui/input";
import { ColorField, FillPicker } from "./fill-picker";
import { DotGlyph, FrameGlyph } from "./glyphs";

export function DesignPanel({
  config,
  patch,
}: {
  config: QRStyleConfig;
  patch: (p: Partial<QRStyleConfig>) => void;
}) {
  const setFill = (key: "dotFill" | "cornerFill") => (f: Fill) =>
    patch({ [key]: f } as Partial<QRStyleConfig>);

  return (
    <div className="space-y-6">
      <section>
        <p className="mb-2 text-[13px] font-medium text-zinc-700">Module shape</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {DOT_STYLES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              title={opt.label}
              onClick={() => patch({ dotStyle: opt.value as DotStyle })}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all duration-150 ${
                config.dotStyle === opt.value
                  ? "border-zinc-900 bg-zinc-900"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <DotGlyph style={opt.value} active={config.dotStyle === opt.value} />
              <span
                className={`w-full truncate px-0.5 text-center text-[10px] font-medium ${
                  config.dotStyle === opt.value ? "text-white" : "text-zinc-500"
                }`}
              >
                {opt.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[13px] font-medium text-zinc-700">Corner eyes</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">Outer frame</p>
            <div className="grid grid-cols-5 gap-1">
              {FRAME_STYLES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.label}
                  onClick={() => patch({ frameStyle: opt.value as CornerFrameStyle })}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                    config.frameStyle === opt.value
                      ? "border-zinc-900 bg-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <FrameGlyph
                    frame={opt.value}
                    ball={config.ballStyle === "dots" ? "dots" : config.ballStyle}
                    active={config.frameStyle === opt.value}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1.5 truncate text-center text-[10px] font-medium text-zinc-400">
              {FRAME_STYLES.find((f) => f.value === config.frameStyle)?.label}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">Center ball</p>
            <div className="grid grid-cols-4 gap-1">
              {BALL_STYLES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.label}
                  onClick={() => patch({ ballStyle: opt.value as CornerBallStyle })}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                    config.ballStyle === opt.value
                      ? "border-zinc-900 bg-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <FrameGlyph
                    frame={config.frameStyle === "leaf" ? "rounded" : config.frameStyle}
                    ball={opt.value}
                    active={config.ballStyle === opt.value}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1.5 truncate text-center text-[10px] font-medium text-zinc-400">
              {BALL_STYLES.find((f) => f.value === config.ballStyle)?.label}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[13px] font-medium text-zinc-700">Color</p>
        <FillPicker label="Modules" value={config.dotFill} onChange={setFill("dotFill")} />
        <FillPicker label="Corner eyes" value={config.cornerFill} onChange={setFill("cornerFill")} />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-zinc-700">Background</span>
            {!config.background.transparent && (
              <span className="w-28">
                <ColorField
                  label="Background color"
                  value={config.background.color}
                  onChange={(c) =>
                    patch({ background: { ...config.background, color: c } })
                  }
                />
              </span>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-500">
            Transparent
            <Switch
              checked={config.background.transparent}
              label="Transparent background"
              onChange={(v) =>
                patch({ background: { ...config.background, transparent: v } })
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}
