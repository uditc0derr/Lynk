"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

export function SettingsForms({
  initialName,
  email,
  memberSince,
}: {
  initialName: string;
  email: string;
  memberSince: string;
}) {
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async () => {
    setProfileError(null);
    setSavingProfile(true);
    try {
      await api("/api/account", { method: "PATCH", json: { name: name.trim() } });
      toast.toast({ title: "Profile updated" });
      router.refresh();
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setPwError(null);
    if (pw.next !== pw.confirm) {
      setPwError("New passwords don't match");
      return;
    }
    setSavingPw(true);
    try {
      await api("/api/account/password", {
        method: "PATCH",
        json: { currentPassword: pw.current, newPassword: pw.next },
      });
      toast.toast({ title: "Password changed", description: "Use your new password next time." });
      setPw({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Could not change password");
    } finally {
      setSavingPw(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api("/api/account", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.toast({
        title: "Could not delete account",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3.5">
          <UserRound className="h-4 w-4 text-zinc-400" />
          <h2 className="text-[14px] font-semibold text-zinc-900">Profile</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-name">Name</Label>
              <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" value={email} disabled />
            </div>
          </div>
          <FieldError message={profileError ?? undefined} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">Member since {memberSince}</p>
            <Button size="sm" onClick={saveProfile} loading={savingProfile} disabled={name.trim() === initialName}>
              Save profile
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3.5">
          <KeyRound className="h-4 w-4 text-zinc-400" />
          <h2 className="text-[14px] font-semibold text-zinc-900">Password</h2>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <Label htmlFor="pw-current">Current password</Label>
            <Input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pw-next">New password</Label>
              <Input
                id="pw-next"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input
                id="pw-confirm"
                type="password"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
          </div>
          <FieldError message={pwError ?? undefined} />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={savePassword}
              loading={savingPw}
              disabled={!pw.current || pw.next.length < 8 || !pw.confirm}
            >
              Change password
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-red-150 border-red-200 bg-white shadow-card">
        <div className="border-b border-red-100 px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-red-700">Danger zone</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">
            Deleting your account removes all links, QR codes and analytics permanently.
          </p>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete account
          </Button>
        </div>
      </section>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description="This erases every link, QR code and event tied to it. There is no undo."
        width="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              disabled={confirmText !== "DELETE"}
              onClick={deleteAccount}
            >
              Delete everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
