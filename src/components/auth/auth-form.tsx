"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await api("/api/auth/signup", {
          method: "POST",
          json: { name: form.name, email: form.email, password: form.password },
        });
      } else {
        await api("/api/auth/login", {
          method: "POST",
          json: { email: form.email, password: form.password },
        });
      }
      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ name: "", email: "demo@lynk.to", password: "lynkdemo" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="password" hint={mode === "signup" ? "At least 8 characters" : undefined}>
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          placeholder={mode === "signup" ? "Create a password" : "Your password"}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" size="lg" loading={loading} className="w-full">
        {mode === "signup" ? "Create account" : "Sign in"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
      {mode === "login" && (
        <button
          type="button"
          onClick={fillDemo}
          className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
        >
          Use demo account — demo@lynk.to / lynkdemo
        </button>
      )}
      <p className="pt-1 text-center text-[13px] text-zinc-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to LYNK?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
