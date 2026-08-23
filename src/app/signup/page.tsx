import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Wordmark } from "@/components/logo";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/70">
      <header className="border-b border-zinc-200/70 bg-white">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center px-5 sm:px-8">
          <Link href="/" className="text-zinc-950">
            <Wordmark />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[380px]">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
            Create your account
          </h1>
          <p className="mb-6 mt-1 text-sm text-zinc-500">
            Free forever for everyday links and QR codes.
          </p>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-card">
            <Suspense fallback={<div className="h-80" />}>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
