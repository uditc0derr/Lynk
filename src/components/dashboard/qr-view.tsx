"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  QrCode,
  ScanLine,
  Search,
  Trash2,
} from "lucide-react";
import { Badge, EmptyState, Segmented } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dropdown,
  DropdownButton,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";
import { SelectMenu } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { compactNumber, relativeTime } from "@/lib/format";
import type { QrTypeKey } from "@/lib/qr/payload";

export interface QrRow {
  id: string;
  name: string;
  type: QrTypeKey;
  dynamic: boolean;
  scanSlug: string | null;
  thumbSvg: string | null;
  scans: number;
  updatedAt: string;
}

type Filter = "all" | "dynamic" | "static";
type Sort = "recent" | "name" | "scans";

export function QrCodesView({ initial }: { initial: QrRow[] }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [deleting, setDeleting] = useState<QrRow | null>(null);
  const toast = useToast();
  const router = useRouter();

  const filtered = useMemo(() => {
    let out = [...rows];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (filter !== "all") out = out.filter((r) => (filter === "dynamic" ? r.dynamic : !r.dynamic));
    switch (sort) {
      case "name":
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "scans":
        out.sort((a, b) => b.scans - a.scans);
        break;
      default:
        out.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }
    return out;
  }, [rows, query, filter, sort]);

  const duplicate = async (row: QrRow) => {
    try {
      const { qrCodes } = await api<{
        qrCodes: {
          id: string;
          name: string;
          type: QrTypeKey;
          content: Record<string, string>;
          config: Record<string, unknown>;
        }[];
      }>("/api/qr");
      const original = qrCodes.find((q) => q.id === row.id);
      await api("/api/qr", {
        method: "POST",
        json: {
          name: `${row.name} copy`,
          type: original?.type ?? "URL",
          content: original?.content ?? {},
          config: original?.config ?? {},
          dynamic: false,
        },
      });
      toast.toast({ title: "Duplicated", description: `${row.name} copy` });
      router.refresh();
    } catch {
      toast.toast({ title: "Could not duplicate", variant: "error" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">QR Codes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {rows.length === 0
              ? "Design once, download anywhere."
              : `${rows.length} code${rows.length === 1 ? "" : "s"} · ${compactNumber(rows.reduce((a, r) => a + r.scans, 0))} total scans`}
          </p>
        </div>
        <Link href="/dashboard/qr/new">
          <Button>
            <QrCode className="h-4 w-4" /> New QR code
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search QR codes"
            className="pl-8.5"
          />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "dynamic", label: "Dynamic" },
            { value: "static", label: "Static" },
          ]}
        />
        <div className="ml-auto w-40">
          <SelectMenu<Sort>
            value={sort}
            onChange={setSort}
            placeholder="Sort"
            options={[
              { value: "recent", label: "Recently updated" },
              { value: "scans", label: "Most scanned" },
              { value: "name", label: "A → Z" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-card">
          {rows.length === 0 ? (
            <EmptyState
              icon={QrCode}
              title="No QR codes yet"
              description="Pick a style, add your logo and colors, then download crisp PNG or SVG files — or go dynamic and retarget anytime."
              action={
                <Link href="/dashboard/qr/new">
                  <Button>
                    <QrCode className="h-4 w-4" /> Design your first QR
                  </Button>
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Nothing matches"
              description="Try another search term or clear the filters."
              action={
                <Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <li key={row.id}>
              <div className="group relative flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_40px_-18px_rgba(9,9,11,0.16)]">
                <Link href={`/dashboard/qr/${row.id}`} className="block">
                  <div className="aspect-square w-full overflow-hidden rounded-lg border border-zinc-100">
                    {row.thumbSvg && (
                      <div
                        className="h-full w-full"
                        dangerouslySetInnerHTML={{ __html: row.thumbSvg }}
                      />
                    )}
                  </div>
                </Link>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/qr/${row.id}`}
                      className="block truncate text-[13.5px] font-semibold text-zinc-900 hover:text-accent"
                    >
                      {row.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {row.type === "URL" ? row.dynamic ? "Dynamic link" : "Link" : row.type.charAt(0) + row.type.slice(1).toLowerCase()} ·{" "}
                      {relativeTime(row.updatedAt)}
                    </p>
                  </div>
                  <Dropdown
                    trigger={({ toggle, ref }) => (
                      <DropdownButton
                        ref={ref}
                        open={false}
                        toggle={toggle}
                        className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-lg text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownButton>
                    )}
                  >
                    <MenuItem icon={<Pencil className="h-3.5 w-3.5" />} onSelect={() => router.push(`/dashboard/qr/${row.id}`)}>
                      Edit design
                    </MenuItem>
                    <MenuItem icon={<ScanLine className="h-3.5 w-3.5" />} onSelect={() => router.push(`/dashboard/qr/${row.id}/analytics`)}>
                      View analytics
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<Download className="h-3.5 w-3.5" />} onSelect={() => duplicate(row)}>
                      Duplicate
                    </MenuItem>
                    {row.scanSlug && (
                      <MenuItem
                        icon={<Copy className="h-3.5 w-3.5" />}
                        onSelect={() => {
                          navigator.clipboard
                            .writeText(`${window.location.origin}/q/${row.scanSlug}`)
                            .then(() =>
                              toast.toast({ title: "Scan URL copied", description: `/q/${row.scanSlug}` })
                            );
                        }}
                      >
                        Copy scan URL
                      </MenuItem>
                    )}
                    <MenuItem icon={<Trash2 className="h-3.5 w-3.5" />} danger onSelect={() => setDeleting(row)}>
                      Delete
                    </MenuItem>
                  </Dropdown>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                  {row.dynamic ? (
                    <Badge tone="accent">Dynamic</Badge>
                  ) : (
                    <Badge>Static</Badge>
                  )}
                  <span className="flex items-center gap-1 tabular text-xs text-zinc-500">
                    <ScanLine className="h-3.5 w-3.5 text-zinc-300" />
                    {compactNumber(row.scans)} scans
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleting && (
        <DeleteQrModal
          row={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
        />
      )}
    </div>
  );
}

function DeleteQrModal({
  row,
  onClose,
  onDeleted,
}: {
  row: QrRow;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const del = async () => {
    setBusy(true);
    try {
      await api(`/api/qr/${row.id}`, { method: "DELETE" });
      onDeleted(row.id);
      toast.toast({ title: "QR deleted", description: row.name });
      onClose();
    } catch (e) {
      toast.toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Delete “${row.name}”?`} width="max-w-sm">
      <p className="text-[13.5px] leading-relaxed text-zinc-500">
        {row.dynamic
          ? "Its short URL stops resolving immediately — anything printed with this code becomes unscannable."
          : "The saved design will be removed permanently."}
      </p>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose}>
          Keep it
        </Button>
        <Button variant="danger" loading={busy} onClick={del}>
          Delete forever
        </Button>
      </div>
    </Modal>
  );
}
