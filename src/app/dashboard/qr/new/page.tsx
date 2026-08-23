import type { Metadata } from "next";
import { QrEditor } from "@/components/qr-editor/editor";

export const metadata: Metadata = { title: "New QR code" };

export default function NewQrPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">
          New QR code
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Design it once, download anywhere — or make it dynamic and retarget any time.
        </p>
      </div>
      <QrEditor />
    </div>
  );
}
