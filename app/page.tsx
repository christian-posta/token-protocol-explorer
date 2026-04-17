import Link from "next/link";
import { ArrowRight, Key, Shield } from "lucide-react";

const PROTOCOLS = [
  {
    id: "oauth1a",
    name: "OAuth 1.0a",
    rfc: "RFC 5849",
    rfcUrl: "https://datatracker.ietf.org/doc/html/rfc5849",
    accent: "border-orange-500/35 hover:border-orange-500/55",
    iconWrap: "bg-orange-500/15 text-orange-400",
    description:
      "Three-legged authorization protocol using HMAC-SHA1 signed requests. Consumer obtains temporary credentials, user grants access, consumer exchanges for access token.",
    scenarios: [
      { label: "Happy Path (3-legged flow)", href: "/oauth1a/happy-path" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Key className="h-3.5 w-3.5" />
          <span>Token Protocol Explorer</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Protocol Explorer</h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          X-ray vision for network authentication protocols. Pick a scenario, step through
          the requests, and watch the cryptographic math at every single hop.
        </p>
      </div>

      {/* Protocol list */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Protocols</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each protocol is a self-contained explorer with annotated sequence diagrams and
            a step-by-step breakdown of the cryptographic signatures.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {PROTOCOLS.map((proto) => (
            <div
              key={proto.id}
              className={`rounded-xl border bg-card p-6 flex flex-col gap-4 transition-colors ${proto.accent}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${proto.iconWrap}`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold tracking-tight">{proto.name}</h2>
                    <a
                      href={proto.rfcUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5 hover:text-foreground transition-colors"
                    >
                      {proto.rfc} ↗
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proto.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {proto.scenarios.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {s.label}
                    <ArrowRight className="h-3 w-3 opacity-70" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          How it works
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Each scenario is a JSON file defining participants, HTTP requests, responses, and
          cryptographic artifacts. The UI is a media player — use Play/Pause or arrow keys
          to step through. Click any arrow in the sequence diagram to jump to that step.
          The right panel shows headers, bodies, and the full HMAC signature breakdown.
        </p>
      </section>
    </div>
  );
}
