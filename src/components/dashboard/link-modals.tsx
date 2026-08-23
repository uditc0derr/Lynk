"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useToast } from "@/components/ui/toast";
import { api, shortUrl } from "@/lib/api";

export function NewLinkModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (link: {
    id: string;
    slug: string;
    destination: string;
    title: string | null;
    disabled: boolean;
    expiresAt: string | null;
    createdAt: string;
    clicks: number;
    clicks30: number;
  }) => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ destination: "", title: "", slug: "" });
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  if (!open) return null;

  const create = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await api<{ link: { id: string; slug: string; destination: string; createdAt: string } }>(
        "/api/links",
        {
          method: "POST",
          json: {
            destination: form.destination.trim(),
            title: form.title.trim() || null,
            ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
            ...(expiresAt ? { expiresAt: expiresAt.toISOString() } : {}),
          },
        }
      );
      onCreated({
        id: res.link.id,
        slug: res.link.slug,
        destination: res.link.destination,
        title: form.title.trim() || null,
        disabled: false,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        createdAt: res.link.createdAt ?? new Date().toISOString(),
        clicks: 0,
        clicks30: 0,
      });
      toast.toast({ title: "Link created", description: shortUrl(res.link.slug) });
      setForm({ destination: "", title: "", slug: "" });
      setExpiresAt(null);
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create link");
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Shorten a new link" width="max-w-lg">
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-dest">Destination URL</Label>
          <Input
            id="new-dest"
            type="url"
            autoFocus
            required
            hasError={!!error}
            placeholder="https://example.com/a-really-long-url"
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-title" hint="Optional">Title</Label>
            <Input
              id="new-title"
              placeholder="Summer campaign"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="new-slug" hint="Optional">Custom alias</Label>
            <Input
              id="new-slug"
              placeholder="summer24"
              className="font-mono text-[13px]"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label hint="Optional">Expires at</Label>
          <DateTimePicker value={expiresAt} onChange={setExpiresAt} placeholder="Never expires" />
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={create} loading={saving}>Create link</Button>
        </div>
      </div>
    </Modal>
  );
}
