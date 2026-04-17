"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, Key, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  color: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "OAuth 1.0a",
    color: "text-orange-400",
    items: [
      { label: "Happy Path (3-legged flow)", href: "/oauth1a/happy-path" },
    ],
  },
  {
    title: "AWS SigV4",
    color: "text-amber-400",
    items: [
      { label: "API Request", href: "/aws-sigv4/api-request" },
    ],
  },
  {
    title: "OAuth 2.0",
    color: "text-indigo-400",
    items: [
      { label: "DPoP (RFC 9449)", href: "/oauth2/dpop" },
      { label: "Token Exchange: Delegation", href: "/oauth2/token-exchange-delegation" },
      { label: "Token Exchange: Impersonation", href: "/oauth2/token-exchange-impersonation" },
    ],
  },
  {
    title: "HTTP Signatures",
    color: "text-teal-400",
    items: [
      { label: "RFC 9421 (Basic)", href: "/http-signatures/rfc9421" },
      { label: "Signature-Key Schemes", href: "/http-signatures/signature-key-schemes" },
    ],
  },
  {
    title: "CB4A",
    color: "text-cyan-400",
    items: [
      { label: "Happy Path (Token Minting)", href: "/cb4a/happy-path" },
    ],
  },
];

function SidebarSection({ section, defaultOpen }: { section: NavSection; defaultOpen: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const isActive = section.items.some((i) => pathname === i.href);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Key className={cn("h-4 w-4 shrink-0", section.color)} />
        <span className="flex-1 text-left">{section.title}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>

      {open && (
        <div className="mt-0.5 ml-4 border-l border-border pl-3 space-y-0.5">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">PE</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Protocol Explorer</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Protocols
        </p>
        {NAV.map((section) => {
          const defaultOpen = section.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
          return (
            <SidebarSection key={section.title} section={section} defaultOpen={defaultOpen || true} />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <a
          href="https://datatracker.ietf.org/doc/html/rfc5849"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          RFC 5849 — OAuth 1.0 ↗
        </a>
      </div>
    </div>
  );
}
