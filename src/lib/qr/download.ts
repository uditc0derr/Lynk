"use client";

import { buildMatrix } from "./matrix";
import { renderSVG } from "./render";
import type { QRStyleConfig } from "./types";

export function svgString(
  text: string,
  config: QRStyleConfig,
  idPrefix = "qr"
): string | null {
  try {
    const matrix = buildMatrix(text, config.ecc);
    return renderSVG(matrix, config, idPrefix);
  } catch {
    return null;
  }
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function withPixelSize(svg: string, px: number) {
  return svg.replace(
    'width="100%" height="100%"',
    `width="${px}" height="${px}"`
  );
}

export function downloadSvg(svg: string, filename: string, px = 1024) {
  const blob = new Blob([withPixelSize(svg, px)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadPng(
  svg: string,
  size: number,
  filename: string
) {
  const blob = new Blob([withPixelSize(svg, size)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no context");
    ctx.drawImage(img, 0, 0, size, size);
    const pngUrl = canvas.toDataURL("image/png");
    triggerDownload(pngUrl, filename);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function shrinkImage(
  file: File,
  maxPx = 512
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  if (file.type === "image/svg+xml") return dataUrl;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  if (scale >= 1 && dataUrl.length < 400000) return dataUrl;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
