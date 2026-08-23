"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  ScanLine,
  Trash2,
} from "lucide-react";
import {
  DEFAULT_QR_CONFIG,
  type QRStyleConfig,
} from "@/lib/qr/types";
import { buildQrPayload, type QrTypeKey } from "@/lib/qr/payload";import { downloadPng, downloadSvg, shrinkImage, svgString } from "@/lib/qr/download";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownButton, MenuItem, MenuLabel } from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Segmented } from "@/components/ui/primitives";
import { ContentPanel } from "./content-panel";
import { DesignPanel } from "./design-panel";
import { LogoPanel, AdvancedPanel } from "./logo-panel";

type Tab = "content" | "design" | "logo" | "advanced";

export interface ExistingQr {
  id: string;
  name: string;
  type: QrTypeKey;
  content: Record<string, string>;
  config: QRStyleConfig;
  dynamic: boolean;
  scanSlug: string | null;
  destination: string | null;
}

function mergeConfig(raw: unknown): QRStyleConfig {
  const base = structuredClone(DEFAULT_QR_CONFIG);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    ...base,
    ...r,
    background: { ...base.background, ...((r.background as object) ?? {}) },
    logo: { ...base.logo, ...((r.logo as object) ?? {}) },
  } as unknown as QRStyleConfig;
}

const PLACEHOLDER_SCAN_URL = "https://lynk.to/q/your-code";

export function QrEditor({ existing }: { existing?: ExistingQr }) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(existing?.name ?? "Untitled code");
  const [type, setType] = useState<QrTypeKey>(existing?.type ?? "URL");
  const [content, setContent] = useState<Record<string, string>>(
    () => existing?.content ?? { url: "" }
  );
  const [config, setConfig] = useState<QRStyleConfig>(() =>
    mergeConfig(existing?.config)
  );
  const [dynamic, setDynamic] = useState(existing?.dynamic ?? false);
  const [scanSlug, setScanSlug] = useState<string | null>(existing?.scanSlug ?? null);
  const [tab, setTab] = useState<Tab>("content");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const patch = (p: Partial<QRStyleConfig>) => setConfig((c) => ({ ...c, ...p }));

  const encodedText = useMemo(() => {
    if (dynamic) {
      return scanSlug
        ? `${typeof window !== "undefined" ? window.location.origin : "https://lynk.to"}/q/${scanSlug}`
        : PLACEHOLDER_SCAN_URL;
    }
    return buildQrPayload(type, content);
  }, [dynamic, scanSlug, type, content]);

  const payloadForUrlType = buildQrPayload("URL", content);

  const previewSvg = useMemo(
    () => (encodedText ? svgString(encodedText, config, "editor") : null),
    [encodedText, config]
  );

  const canSave = dynamic
    ? /^https?:\/\/.+/.test(payloadForUrlType)
    : encodedText.length > 0;

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await shrinkImage(file, 512);
      patch({ logo: { ...config.logo, enabled: true, src: dataUrl } });
      toast.toast({ title: "Logo added", description: file.name });
    } catch {
      toast.toast({
        title: "Could not read that image",
        description: "Try a PNG, JPG or SVG under a few MB.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      if (existing) {
        await api(`/api/qr/${existing.id}`, {
          method: "PATCH",
          json: {
            name: name.trim() || "Untitled code",
            type,
            content,
            config,
            ...(dynamic && type === "URL"
              ? { destination: payloadForUrlType }
              : {}),
          },
        });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
        toast.toast({ title: "QR code saved", description: name });
        router.refresh();
      } else {
        const res = await api<{
          qr: { id: string };
          scanSlug: string | null;
        }>("/api/qr", {
          method: "POST",
          json: {
            name: name.trim() || "Untitled code",
            type,
            content,
            config,
            dynamic,
          },
        });
        toast.toast({
          title: "QR code created",
          description: dynamic ? "Your short URL is live." : name,
        });
        if (dynamic && res.scanSlug) setScanSlug(res.scanSlug);
        window.history.replaceState(null, "", `/dashboard/qr/${res.qr.id}`);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!existing) return;
    try {
      await api(`/api/qr/${existing.id}`, { method: "DELETE" });
      toast.toast({ title: "QR deleted", description: name });
      router.push("/dashboard/qr");
      router.refresh();
    } catch (e) {
      toast.toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    }
  };

  const download = async (kind: "svg" | "png1024" | "png2048") => {
    if (!previewSvg) return;
    const safeName =
      (name.trim() || "lynk-qr").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "lynk-qr";
    try {
      if (kind === "svg") {
        downloadSvg(previewSvg, `${safeName}.svg`);
      } else {
        await downloadPng(previewSvg, kind === "png2048" ? 2048 : 1024, `${safeName}.png`);
      }
      toast.toast({
        title: "Download started",
        description: `${safeName}.${kind === "svg" ? "svg" : "png"}`,
      });
    } catch {
      toast.toast({ title: "Download failed", variant: "error" });
    }
  };

  const copyEncoded = async () => {
    await navigator.clipboard.writeText(encodedText).catch(() => {});
    toast.toast({ title: "Copied", description: encodedText.slice(0, 60) });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard/qr"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Back to QR codes"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="QR code name"
              className="h-9 max-w-[240px] border-transparent bg-transparent px-1.5 text-[16px] font-semibold shadow-none hover:border-zinc-200 focus:border-zinc-300 focus:bg-white"
            />
            <p className="px-1.5 text-xs text-zinc-400">
              {dynamic && scanSlug ? (
                <span className="font-mono">/q/{scanSlug}</span>
              ) : dynamic ? (
                "Save to mint your short URL"
              ) : (
                `${type} · ${existing ? "Editing saved code" : "New code"}`
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {existing && (
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Dropdown
            width="w-44"
            trigger={({ toggle, ref }) => (
              <DropdownButton
                ref={ref}
                open={false}
                toggle={toggle}
                className="h-[34px] rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-700 shadow-card hover:border-zinc-300 hover:bg-zinc-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownButton>
            )}
          >
            <MenuLabel>Image</MenuLabel>
            <MenuItem
              icon={<span className="font-mono text-[10px]">PNG</span>}
              onSelect={() => download("png1024")}
            >
              PNG · 1024 px
            </MenuItem>
            <MenuItem
              icon={<span className="font-mono text-[10px]">PNG</span>}
              onSelect={() => download("png2048")}
            >
              PNG · 2048 px
            </MenuItem>
            <MenuItem
              icon={<span className="font-mono text-[10px]">SVG</span>}
              onSelect={() => download("svg")}
            >
              SVG · vector
            </MenuItem>
          </Dropdown>
          <Button size="sm" onClick={save} loading={saving} disabled={!canSave}>
            {!saving && justSaved && <Check className="h-3.5 w-3.5" />}
            {existing ? "Save changes" : "Create QR"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card sm:p-6">
          <Segmented<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: "content", label: "Content" },
              { value: "design", label: "Design" },
              { value: "logo", label: "Logo" },
              { value: "advanced", label: "Advanced" },
            ]}
            className="mb-6"
          />
          {tab === "content" && (
            <ContentPanel
              type={type}
              onTypeChange={(t) => setType(t)}
              content={content}
              onContentChange={(key, value) =>
                setContent((c) => ({ ...c, [key]: value }))
              }
              dynamic={dynamic}
              onDynamicChange={(v) => {
                if (!scanSlug) setDynamic(v);
              }}
              scanSlug={scanSlug}
              error={error}
            />
          )}
          {tab === "design" && <DesignPanel config={config} patch={patch} />}
          {tab === "logo" && (
            <LogoPanel
              config={config}
              patch={patch}
              onUpload={onUpload}
              uploading={uploading}
            />
          )}
          {tab === "advanced" && <AdvancedPanel config={config} patch={patch} />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="grid-paper rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
            <div className="mx-auto w-full max-w-[260px] rounded-xl border border-zinc-200 bg-white p-4 shadow-card">
              {previewSvg ? (
                <div
                  key={encodedText.length}
                  className="aspect-square w-full animate-qr-in"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                  role="img"
                  aria-label="QR preview"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50">
                  <p className="max-w-[20ch] text-center text-xs text-zinc-400">
                    Fill in the content to see your code
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={copyEncoded}
              className="mx-auto mt-4 flex max-w-full items-center gap-1.5 rounded-md bg-white/80 px-2 py-1 font-mono text-[11px] text-zinc-500 ring-1 ring-black/5 transition-colors hover:text-zinc-800"
            >
              <Copy className="h-3 w-3 shrink-0" />
              <span className="truncate">{encodedText || "empty"}</span>
            </button>
          </div>

          {dynamic ? (
            <div className="space-y-2.5 rounded-xl border border-accent-border bg-accent-soft/60 p-3.5 text-[12.5px] leading-relaxed text-indigo-900">
              <div className="flex items-start gap-2.5">
                <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <span>
                  This code scans a LYNK URL. Edit the destination any time - the artwork
                  stays valid forever.
                </span>
              </div>
              {existing && (
                <Link
                  href={`/dashboard/qr/${existing.id}/analytics`}
                  className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 font-medium text-indigo-700 ring-1 ring-indigo-200 transition-colors hover:bg-white"
                >
                  View scan analytics
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white p-3.5 text-[12.5px] leading-relaxed text-zinc-500">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
              <span>
                Static code - your data lives in the pattern itself. Make it dynamic to
                track scans and retarget later.
              </span>
            </div>
          )}

          <dl className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-[12.5px] shadow-card">
            {[
              ["Modules", config.dotStyle.replace(/-/g, " ")],
              ["Error correction", config.ecc],
              ["Margin", `${config.margin} module${config.margin === 1 ? "" : "s"}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-zinc-400">{k}</dt>
                <dd className="truncate font-medium capitalize text-zinc-600">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {existing && (
        <Modal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete this QR code?"
          description={
            dynamic
              ? "Its short URL stops resolving immediately. Anything printed with this code becomes unscannable."
              : "The saved design will be removed. This cannot be undone."
          }
          width="max-w-sm"
        >
          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={doDelete}>
              Delete forever
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
