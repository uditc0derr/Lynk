"use client";

import type { EccLevel, QRStyleConfig } from "@/lib/qr/types";
import { Segmented } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/input";
import { ColorField } from "./fill-picker";

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-[13px] font-medium text-zinc-700">
        {label}
        <span className="tabular text-xs font-normal text-zinc-400">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </label>
  );
}

export function LogoPanel({
  config,
  patch,
  onUpload,
  uploading,
}: {
  config: QRStyleConfig;
  patch: (p: Partial<QRStyleConfig>) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const logo = config.logo;
  const setLogo = (p: Partial<typeof logo>) => patch({ logo: { ...logo, ...p } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3.5 py-3">
        <div>
          <p className="text-[13px] font-semibold text-zinc-800">Center logo</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Modules under the logo are cleared automatically.
          </p>
        </div>
        <Switch
          checked={logo.enabled}
          label="Enable logo"
          onChange={(v) => setLogo({ enabled: v })}
        />
      </div>

      {logo.enabled && (
        <>
          <div>
            <p className="mb-2 text-[13px] font-medium text-zinc-700">Image</p>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex h-9 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 shadow-card transition-colors hover:border-zinc-300 hover:bg-zinc-50">
                {uploading ? "Processing..." : logo.src ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Upload logo image"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {logo.src && (
                <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.src}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              PNG, JPG, WebP or SVG - resized automatically.
            </p>
          </div>

          <SliderRow
            label="Size"
            value={logo.size}
            min={10}
            max={40}
            step={1}
            suffix="%"
            onChange={(v) => setLogo({ size: v })}
          />
          <SliderRow
            label="Padding"
            value={logo.padding}
            min={0}
            max={20}
            step={1}
            suffix="%"
            onChange={(v) => setLogo({ padding: v })}
          />

          <div>
            <p className="mb-2 text-[13px] font-medium text-zinc-700">Backing shape</p>
            <Segmented
              value={logo.shape}
              onChange={(s) => setLogo({ shape: s as typeof logo.shape })}
              options={[
                { value: "none", label: "None" },
                { value: "square", label: "Square" },
                { value: "circle", label: "Circle" },
              ]}
            />
          </div>

          {logo.shape !== "none" && (
            <div className="w-36">
              <p className="mb-1.5 text-[13px] font-medium text-zinc-700">Backing color</p>
              <ColorField
                label="Logo backing color"
                value={logo.bgColor}
                onChange={(c) => setLogo({ bgColor: c })}
              />
            </div>
          )}

          <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
            Tip: raise error correction to High in Advanced so scanners can still read
            around the logo.
          </p>
        </>
      )}
    </div>
  );
}

export function AdvancedPanel({
  config,
  patch,
}: {
  config: QRStyleConfig;
  patch: (p: Partial<QRStyleConfig>) => void;
}) {
  return (
    <div className="space-y-6">
      <SliderRow
        label="Quiet margin"
        value={config.margin}
        min={0}
        max={6}
        step={1}
        suffix=" modules"
        onChange={(v) => patch({ margin: v })}
      />

      <div>
        <p className="mb-2 text-[13px] font-medium text-zinc-700">Error correction</p>
        <Segmented
          value={config.ecc}
          onChange={(ecc) => patch({ ecc: ecc as EccLevel })}
          options={[
            { value: "L", label: "Low" },
            { value: "M", label: "Medium" },
            { value: "Q", label: "Quartile" },
            { value: "H", label: "High" },
          ]}
        />
        <ul className="mt-2.5 space-y-1 text-xs leading-relaxed text-zinc-400">
          <li>Higher levels survive damage and logos, but make the code denser.</li>
          <li>L recovers ~7% · M ~15% · Q ~25% · H ~30%.</li>
        </ul>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3.5">
        <p className="text-[13px] font-semibold text-zinc-800">Export</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
          Downloads render from your exact settings - PNG up to 2048px or infinitely
          scalable SVG for print shops.
        </p>
      </div>
    </div>
  );
}
