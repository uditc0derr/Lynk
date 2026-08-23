"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  PowerOff,
  Search,
  Trash2,
} from "lucide-react";
import { Badge, EmptyState, Segmented, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dropdown,
  DropdownButton,
  MenuItem,
  MenuSeparator,
  SelectMenu,
} from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label, Switch, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, shortUrl } from "@/lib/api";
import { compactNumber, formatDate } from "@/lib/format";
import { NewLinkModal } from "./link-modals";

export interface LinkRow {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  disabled: boolean;
  expiresAt: string | null;
  createdAt: string;
  clicks: number;
  clicks30: number;
}

type Filter = "all" | "active" | "disabled" | "expired";
type Sort = "newest" | "oldest" | "clicks" | "alpha";

export function isExpired(l: LinkRow) {
  return !!l.expiresAt && new Date(l.expiresAt) < new Date();
}

function statusOf(l: LinkRow): "active" | "expired" | "disabled" {
  if (l.disabled) return "disabled";
  if (isExpired(l)) return "expired";
  return "active";
}

export function LinksView({ initialLinks }: { initialLinks: LinkRow[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<LinkRow | null>(null);
  const [deleting, setDeleting] = useState<LinkRow | null>(null);

  const filtered = useMemo(() => {
    let out = [...links];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (l) =>
          l.slug.toLowerCase().includes(q) ||
          l.destination.toLowerCase().includes(q) ||
          (l.title ?? "").toLowerCase().includes(q)
      );
    }
    if (filter !== "all") {
      out = out.filter((l) => statusOf(l) === filter);
    }
    switch (sort) {
      case "oldest":
        out.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "clicks":
        out.sort((a, b) => b.clicks - a.clicks);
        break;
      case "alpha":
        out.sort((a, b) =>
          (a.title || a.slug).localeCompare(b.title || b.slug)
        );
        break;
      default:
        out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return out;
  }, [links, query, filter, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">My Links</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {links.length === 0
              ? "Everything you shorten will live here."
              : `${links.length} link${links.length === 1 ? "" : "s"} · ${compactNumber(links.reduce((a, l) => a + l.clicks, 0))} total clicks`}
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Link2 className="h-4 w-4" /> Shorten new link
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search links…"
            aria-label="Search links"
            className="pl-8.5"
          />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <div className="ml-auto w-40">
          <SelectMenu<Sort>
            value={sort}
            onChange={setSort}
            placeholder="Sort"
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "clicks", label: "Most clicked" },
              { value: "alpha", label: "A → Z" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-card">
          {links.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No links yet"
              description="Paste a long URL and LYNK gives you a short, memorable one — ready to edit, track and share."
              action={
                <Button onClick={() => setNewOpen(true)}>
                  <Link2 className="h-4 w-4" /> Create your first link
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Nothing matches"
              description="Try a different search term or clear the filters to see everything."
              action={
                <Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card">
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3">Link</th>
                <th className="w-28 px-3 py-3 text-right">Clicks</th>
                <th className="w-28 px-3 py-3">Status</th>
                <th className="w-28 px-3 py-3">Created</th>
                <th className="w-12 py-3 pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((l) => (
                <Row key={l.id} link={l} onEdit={() => setEditing(l)} onDelete={() => setDeleting(l)} setLinks={setLinks} desktop />
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-zinc-100 md:hidden">
            {filtered.map((l) => (
              <Row key={l.id} link={l} onEdit={() => setEditing(l)} onDelete={() => setDeleting(l)} setLinks={setLinks} />
            ))}
          </ul>
        </div>
      )}

      <NewLinkModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={(l) => setLinks((prev) => [l, ...prev])} />
      {editing && (
        <EditLinkModal
          link={editing}
          onClose={() => setEditing(null)}
          onSaved={(l) =>
            setLinks((prev) =>
              prev.map((x) => (x.id === l.id ? { ...x, ...l, clicks: x.clicks, clicks30: x.clicks30 } : x))
            )
          }
        />
      )}
      {deleting && (
        <DeleteLinkModal
          link={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => setLinks((prev) => prev.filter((l) => l.id !== id))}
        />
      )}
    </div>
  );
}

function Row({
  link,
  onEdit,
  onDelete,
  setLinks,
  desktop = false,
}: {
  link: LinkRow;
  onEdit: () => void;
  onDelete: () => void;
  setLinks: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  desktop?: boolean;
}) {
  const toast = useToast();
  const status = statusOf(link);

  const copyValue = () => shortUrl(link.slug);

  const toggleDisabled = async () => {
    try {
      await api(`/api/links/${link.id}`, { method: "PATCH", json: { disabled: !link.disabled } });
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, disabled: !l.disabled } : l))
      );
      toast.toast({
        title: !link.disabled ? "Link disabled" : "Link re-enabled",
        description: `/${link.slug}`,
        variant: !link.disabled ? "info" : "success",
      });
    } catch (e) {
      toast.toast({
        title: "Could not update",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    }
  };

  const menu = (
    <Dropdown
      trigger={({ toggle, ref }) => (
        <DropdownButton
          ref={ref}
          open={false}
          toggle={toggle}
          className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownButton>
      )}
    >
      <MenuItem icon={<Pencil className="h-3.5 w-3.5" />} onSelect={onEdit}>
        Edit details
      </MenuItem>
      <MenuItem icon={<ExternalLink className="h-3.5 w-3.5" />} onSelect={() => window.open(copyValue(), "_blank")}>
        Open short URL
      </MenuItem>
      <MenuItem
        icon={<PowerOff className="h-3.5 w-3.5" />}
        onSelect={toggleDisabled}
      >
        {link.disabled ? "Enable again" : "Disable temporarily"}
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Trash2 className="h-3.5 w-3.5" />} danger onSelect={onDelete}>
        Delete forever
      </MenuItem>
    </Dropdown>
  );

  if (!desktop) {
    return (
      <li className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-zinc-900">
              {link.title || link.destination.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48)}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-accent">lynk.to/{link.slug}</p>
          </div>
          {menu}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
          <Badge tone={status === "active" ? "green" : status === "expired" ? "amber" : "neutral"}>
            {status === "active" ? "Active" : status === "expired" ? "Expired" : "Disabled"}
          </Badge>
          <span className="tabular">{compactNumber(link.clicks)} clicks</span>
          <span>{formatDate(link.createdAt)}</span>
          <CopyButton value={copyValue} size="sm" className="-my-1 ml-auto text-zinc-300 hover:text-zinc-600" />
        </div>
      </li>
    );
  }

  return (
    <tr className="group transition-colors hover:bg-zinc-50/70">
      <td className="max-w-0 px-5 py-3.5">
        <Link href={`/dashboard/links/${link.id}`} className="block truncate text-[13.5px] font-medium text-zinc-900 hover:text-accent">
          {link.title || link.destination.replace(/^https?:\/\/(www\.)?/, "").slice(0, 56)}
        </Link>
        <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-zinc-400">
          <Link2 className="h-3 w-3 shrink-0" />
          <span className="truncate">lynk.to/{link.slug}</span>
          <CopyButton value={copyValue} size="sm" className="opacity-0 transition-opacity hover:bg-zinc-200/60 hover:text-zinc-700 group-hover:opacity-100" />
        </p>
      </td>
      <td className="px-3 py-3.5 text-right">
        <span className="tabular text-[13.5px] font-semibold text-zinc-900">{compactNumber(link.clicks)}</span>
        <span className="mt-0.5 block text-[11px] text-zinc-400">{compactNumber(link.clicks30)} in 30d</span>
      </td>
      <td className="px-3 py-3.5">
        <Badge tone={status === "active" ? "green" : status === "expired" ? "amber" : "neutral"}>
          {status === "active" ? "Active" : status === "expired" ? "Expired" : "Disabled"}
        </Badge>
      </td>
      <td className="px-3 py-3.5 text-[13px] text-zinc-500">{formatDate(link.createdAt)}</td>
      <td className="py-3.5 pr-4 text-right">{menu}</td>
    </tr>
  );
}

function EditLinkModal({
  link,
  onClose,
  onSaved,
}: {
  link: LinkRow;
  onClose: () => void;
  onSaved: (l: Partial<LinkRow>) => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    destination: link.destination,
    title: link.title ?? "",
    slug: link.slug,
    expiresAt: link.expiresAt ? new Date(link.expiresAt) : null,
    disabled: link.disabled,
  });

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await api(`/api/links/${link.id}`, {
        method: "PATCH",
        json: {
          destination: form.destination.trim(),
          title: form.title.trim() || null,
          slug: form.slug.trim() !== link.slug ? form.slug.trim() : undefined,
          expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
          disabled: form.disabled,
        },
      });
      onSaved({
        id: link.id,
        destination: form.destination.trim(),
        title: form.title.trim() || null,
        slug: link.slug,
        expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
        disabled: form.disabled,
      });
      if (form.slug.trim() !== link.slug && form.slug.trim()) {
        onSaved({ id: link.id, slug: form.slug.trim() });
      }
      toast.toast({ title: "Changes saved", description: `/${form.slug}` });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit link"
      description={`lynk.to/${link.slug}`}
      width="max-w-lg"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-title" hint="Optional">Title</Label>
          <Input
            id="edit-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Summer campaign"
          />
        </div>
        <div>
          <Label htmlFor="edit-dest">Destination URL</Label>
          <Textarea
            id="edit-dest"
            rows={2}
            hasError={!!error}
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            className="font-mono text-[12.5px]"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-slug">Custom alias</Label>
            <Input
              id="edit-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="font-mono text-[13px]"
            />
          </div>
          <div>
            <Label>Expires at</Label>
            <DateTimePicker
              value={form.expiresAt}
              onChange={(d) => setForm((f) => ({ ...f, expiresAt: d }))}
              placeholder="Never expires"
            />
          </div>
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-zinc-400" />
            <div>
              <p className="text-[13px] font-medium text-zinc-800">Temporarily disabled</p>
              <p className="text-xs text-zinc-400">Visitors see an inactive page</p>
            </div>
          </div>
          <Switch checked={form.disabled} label="Disable link" onChange={(v) => setForm((f) => ({ ...f, disabled: v }))} />
        </div>
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteLinkModal({
  link,
  onClose,
  onDeleted,
}: {
  link: LinkRow;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const del = async () => {
    setDeleting(true);
    try {
      await api(`/api/links/${link.id}`, { method: "DELETE" });
      onDeleted(link.id);
      toast.toast({ title: "Link deleted", description: `/${link.slug} is gone for good.` });
      onClose();
    } catch (e) {
      toast.toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
      setDeleting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Delete this link?" width="max-w-sm">
      <p className="text-[13.5px] leading-relaxed text-zinc-500">
        <span className="font-mono text-zinc-800">/{link.slug}</span> will stop working immediately
        and its click history will be erased. This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose}>Keep it</Button>
        <Button variant="danger" loading={deleting} onClick={del}>Delete forever</Button>
      </div>
    </Modal>
  );
}

export function LinksSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2.5">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
