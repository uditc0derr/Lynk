import Link from "next/link";
import { SiteNav } from "@/components/marketing/nav";
import { ShortenForm } from "@/components/marketing/shorten-form";
import { QrShowcase } from "@/components/marketing/showcase";
import { MiniEditor } from "@/components/marketing/mini-editor";
import {
  AnalyticsBrowserPreview,
  AnalyticsChartPreview,
  LinksTablePreview,
} from "@/components/marketing/previews";
import {
  DynamicExplainer,
  FinalCta,
  SiteFooter,
} from "@/components/marketing/footer";

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-xl">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
        {eyebrow}
      </p>
      <h2 className="mt-2.5 text-balance text-[28px] font-semibold leading-tight tracking-tight text-zinc-950 sm:text-[32px]">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{body}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[480px] grid-paper opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12.5px] font-medium text-zinc-500 shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Link management, plus a full QR design studio
              </p>
              <h1 className="mt-6 text-balance text-[42px] font-semibold leading-[1.06] tracking-[-0.03em] text-zinc-950 sm:text-[64px]">
                Make every link easier to share.
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-balance text-[17px] leading-relaxed text-zinc-500">
                Paste a URL to get a clean short link in seconds — then design a QR
                code people actually want to scan.
              </p>
            </div>

            <div className="mx-auto mt-9 max-w-xl">
              <ShortenForm />
            </div>

            <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-zinc-200 pt-8 text-center">
              {[
                ["12M+", "links shortened"],
                ["99.99%", "redirect uptime"],
                ["<40ms", "average redirect"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="order-last mt-1 text-[13px] text-zinc-400">{l}</dt>
                  <dd className="text-2xl font-semibold tabular tracking-tight text-zinc-900">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="qr-studio" className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="QR Studio"
                title="Every style is a real setting, not a filter."
                body="Module shapes, corner eyes, gradients, transparency, logos with padding and masks. Configure it once — download as PNG or SVG at any size."
              />
              <Link
                href="/signup"
                className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-indigo-700"
              >
                Open the studio
                <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
            <div className="mt-12 lg:max-w-[92%] xl:max-w-full">
              <QrShowcase />
            </div>
          </div>
        </section>

        <section id="editor" className="border-t border-zinc-200 bg-zinc-50/60">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <SectionHeading
              eyebrow="The editor"
              title="Controls on the left. Your code, instantly."
              body="This is a live slice of the LYNK editor — tap through the options and watch the code redraw in real time."
            />
            <div className="mt-12">
              <MiniEditor />
            </div>
          </div>
        </section>

        <section id="links" className="border-t border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="lg:pt-4">
              <SectionHeading
                eyebrow="Link management"
                title="Built for links you'll touch again."
                body="Rename, retarget, schedule an expiry, or switch a link off without breaking anything that points at it. Search, sort and act on hundreds of links from one table."
              />
              <ul className="mt-7 space-y-3.5">
                {[
                  "Custom aliases that stay yours",
                  "Edit destinations any time — no reprinting",
                  "Disable or expire links on your schedule",
                  "Full history of every click",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-zinc-600">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <LinksTablePreview />
          </div>
        </section>

        <section id="dynamic" className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <SectionHeading
              eyebrow="Dynamic QR codes"
              title="Print once. Retarget forever."
              body="Static codes freeze your destination into the ink. Dynamic LYNK codes encode a short link instead — so the artwork stays put while the destination moves."
            />
            <div className="mt-12">
              <DynamicExplainer />
            </div>
          </div>
        </section>

        <section id="analytics" className="border-t border-zinc-200 bg-zinc-50/60">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <AnalyticsChartPreview />
            <div className="lg:pt-4">
              <SectionHeading
                eyebrow="Analytics"
                title="Know where every click came from."
                body="Clicks and scans over time, devices, browsers, referrers and approximate regions — collected without cookies, fingerprints or stored IPs."
              />
              <div className="mt-7 max-w-sm">
                <AnalyticsBrowserPreview />
              </div>
            </div>
          </div>
        </section>
      </main>

      <FinalCta />
      <SiteFooter />
    </div>
  );
}
