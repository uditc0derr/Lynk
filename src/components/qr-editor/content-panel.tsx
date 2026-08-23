"use client";

import { QR_TYPES, type QrTypeKey } from "@/lib/qr/payload";
import { FieldError, Input, Label, Switch, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/primitives";

export function ContentPanel({
  type,
  onTypeChange,
  content,
  onContentChange,
  dynamic,
  onDynamicChange,
  scanSlug,
  error,
}: {
  type: QrTypeKey;
  onTypeChange: (t: QrTypeKey) => void;
  content: Record<string, string>;
  onContentChange: (key: string, value: string) => void;
  dynamic: boolean;
  onDynamicChange: (v: boolean) => void;
  scanSlug?: string | null;
  error?: string | null;
}) {
  const meta = QR_TYPES[type];
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[13px] font-medium text-zinc-700">What should it open?</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(QR_TYPES) as QrTypeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onTypeChange(key)}
              className={`rounded-lg border px-2 py-2 text-[12px] font-medium transition-all duration-150 ${
                type === key
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {QR_TYPES[key].label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-400">{meta.hint}</p>
      </div>

      <div className="space-y-3.5">
        {meta.fields.map((field) =>
          field.type === "textarea" ? (
            <div key={field.key}>
              <Label htmlFor={`f-${field.key}`} hint={field.optional ? "Optional" : undefined}>
                {field.label}
              </Label>
              <Textarea
                id={`f-${field.key}`}
                value={content[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => onContentChange(field.key, e.target.value)}
              />
            </div>
          ) : (
            <div key={field.key}>
              <Label htmlFor={`f-${field.key}`} hint={field.optional ? "Optional" : undefined}>
                {field.label}
              </Label>
              <Input
                id={`f-${field.key}`}
                type={field.type === "url" ? "text" : field.type}
                value={content[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => onContentChange(field.key, e.target.value)}
              />
            </div>
          )
        )}
      </div>

      {type === "URL" && (
        <div className="rounded-lg border border-zinc-200 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-zinc-800">Dynamic code</p>
              <p className="mt-0.5 max-w-[38ch] text-xs leading-relaxed text-zinc-400">
                Encodes a short lynk.to URL instead of your destination - retarget
                anytime without reprinting, and every scan gets tracked.
              </p>
            </div>
            <Switch checked={dynamic} label="Make this QR dynamic" onChange={onDynamicChange} />
          </div>
          {dynamic && (
            <>
              {scanSlug ? (
                <p className="mt-2.5 rounded-md bg-accent-soft px-2.5 py-1.5 font-mono text-[11.5px] text-indigo-700">
                  /q/{scanSlug}
                </p>
              ) : (
                <p className="mt-2.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11.5px] leading-snug text-amber-700">
                  Save to mint your short URL - the printed artwork never changes after
                  that.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <FieldError message={error ?? undefined} />
    </div>
  );
}

export function DynamicBadge({ dynamic }: { dynamic: boolean }) {
  if (!dynamic) return null;
  return <Badge tone="accent">Dynamic</Badge>;
}
