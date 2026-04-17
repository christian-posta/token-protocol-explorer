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
  {
    id: "aws-sigv4",
    name: "AWS SigV4",
    rfc: "AWS Docs",
    rfcUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-signing.html",
    accent: "border-amber-500/35 hover:border-amber-500/55",
    iconWrap: "bg-amber-500/15 text-amber-400",
    description:
      "AWS Signature Version 4 protocol for authenticating API requests. Features a 4-step signing process deriving a scope-limited signing key from the AWS secret access key.",
    scenarios: [
      { label: "API Request (STS)", href: "/aws-sigv4/api-request" },
    ],
  },
  {
    id: "oauth2",
    name: "OAuth 2.0",
    rfc: "RFC 6749",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc6749.txt",
    accent: "border-indigo-500/35 hover:border-indigo-500/55",
    iconWrap: "bg-indigo-500/15 text-indigo-400",
    description:
      "The industry-standard authorization framework. Explore advanced extension profiles like Proof-of-Possession (DPoP), PKCE, and token exchange.",
    scenarios: [
      { label: "DPoP (RFC 9449)", href: "/oauth2/dpop" },
      { label: "Token Exchange: Delegation", href: "/oauth2/token-exchange-delegation" },
      { label: "Token Exchange: Impersonation", href: "/oauth2/token-exchange-impersonation" },
      { label: "Txn-Tokens (Draft)", href: "/oauth2/transaction-tokens" },
    ],
  },
  {
    id: "http-signatures",
    name: "HTTP Signatures",
    rfc: "RFC 9421",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9421.txt",
    accent: "border-teal-500/35 hover:border-teal-500/55",
    iconWrap: "bg-teal-500/15 text-teal-400",
    description:
      "A powerful mechanism for creating and verifying digital signatures over HTTP messages, protecting integrity and authenticity of headers and payloads.",
    scenarios: [
      { label: "Basic Signature", href: "/http-signatures/rfc9421" },
      { label: "Signature-Key Header (Draft)", href: "/http-signatures/signature-key-schemes" },
    ],
  },
  {
    id: "cb4a",
    name: "Credential Broker for Agents",
    rfc: "draft-hartman-cb4a-00",
    rfcUrl: "https://datatracker.ietf.org/doc/draft-hartman-credential-broker-4-agents/",
    accent: "border-cyan-500/35 hover:border-cyan-500/55",
    iconWrap: "bg-cyan-500/15 text-cyan-400",
    description:
      "IETF draft protocol that solves credential sprawl in agentic AI systems. Instead of agents holding long-lived API keys, a Policy Decision Point (PDP) and Credential Delivery Point (CDP) collaborate to issue short-lived, DPoP-bound tokens.",
    scenarios: [
      { label: "Happy Path (Token Minting)", href: "/cb4a/happy-path" },
    ],
  },
  {
    id: "mcp-auth",
    name: "MCP Authorization",
    rfc: "MCP Auth Draft",
    rfcUrl: "https://modelcontextprotocol.io/",
    accent: "border-purple-500/35 hover:border-purple-500/55",
    iconWrap: "bg-purple-500/15 text-purple-400",
    description:
      "The Model Context Protocol Authorization flow utilizing OAuth 2.1, PKCE, and Protected Resource Metadata for secure client-server communication.",
    scenarios: [
      { label: "Auth Code + PKCE", href: "/mcp-auth/authorization-code-pkce" },
    ],
  },
  {
    id: "aauth",
    name: "AAuth",
    rfc: "aauth.dev",
    rfcUrl: "https://aauth.dev",
    accent: "border-rose-500/35 hover:border-rose-500/55",
    iconWrap: "bg-rose-500/15 text-rose-400",
    description:
      "AAuth is an Agent Authentication protocol designed for programmatic, autonomous agent-to-agent communication.",
    scenarios: [
      { label: "Protocol Explorer", href: process.env.NEXT_PUBLIC_AAUTH_URL || "https://aauth-implementation.vercel.app", external: true },
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
                {proto.scenarios.map((s) => 
                  "external" in s && s.external ? (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {s.label} ↗
                    </a>
                  ) : (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {s.label}
                      <ArrowRight className="h-3 w-3 opacity-70" />
                    </Link>
                  )
                )}
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
