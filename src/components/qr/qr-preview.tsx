"use client";

import { useMemo } from "react";
import { svgString } from "@/lib/qr/download";
import type { QRStyleConfig } from "@/lib/qr/types";

export function QrPreview({
  text,
  config,
  className = "",
  animate = true,
}: {
  text: string;
  config: QRStyleConfig;
  className?: string;
  animate?: boolean;
}) {
  const svg = useMemo(() => (text ? svgString(text, config, "qrx") : null), [text, config]);

  return (
    <div
      className={`relative ${className}`}
      aria-label="QR code preview"
      role="img"
    >
      <div
        className={`h-full w-full ${animate ? "animate-qr-in" : ""}`}
        dangerouslySetInnerHTML={{
          __html:
            svg ??
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><rect width="21" height="21" fill="#fafafa"/></svg>`,
        }}
      />
    </div>
  );
}

export function QrThumb({
  text,
  config,
  size = 40,
}: {
  text: string;
  config: QRStyleConfig;
  size?: number;
}) {
  const svg = useMemo(
    () => (text ? svgString(text, config, `qt${size}`) : null),
    [text, config, size]
  );
  return (
    <div style={{ width: size, height: size }} aria-hidden>
      <div
        className="h-full w-full"
        dangerouslySetInnerHTML={{ __html: svg ?? "" }}
      />
    </div>
  );
}
