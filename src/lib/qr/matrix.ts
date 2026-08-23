import qrcode from "qrcode-generator";
import type { EccLevel } from "./types";

export interface QRMatrix {
  size: number;
  isDark(row: number, col: number): boolean;
}

const utf8ToBytes = (s: string) => Array.from(new TextEncoder().encode(s));

export function buildMatrix(text: string, ecc: EccLevel): QRMatrix {
  qrcode.stringToBytes = utf8ToBytes;
  const qr = qrcode(0, ecc);
  qr.addData(text);
  qr.make();
  return { size: qr.getModuleCount(), isDark: (r, c) => qr.isDark(r, c) };
}

export function isInFinder(row: number, col: number, size: number) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
}
