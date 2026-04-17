"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { CryptoArtifact } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  "hmac-sha1":   { label: "HMAC-SHA1",   color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  "hmac-sha256": { label: "HMAC-SHA256", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  "rsa-sha256":  { label: "RSA-SHA256",  color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  "jwt":         { label: "JWT",         color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  "custom":      { label: "Custom",      color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

interface CryptoArtifactVisualizerProps {
  artifacts: CryptoArtifact[];
}

export function CryptoArtifactVisualizer({ artifacts }: CryptoArtifactVisualizerProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (artifacts.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/20">
        <span className="text-xs font-semibold">Cryptographic Signature</span>
      </div>

      {artifacts.map((artifact, idx) => {
        const meta = TYPE_LABELS[artifact.type] ?? TYPE_LABELS["custom"];
        const isOpen = openIdx === idx;

        return (
          <div key={idx} className="border-b border-border last:border-0">
            {/* Header row */}
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
            >
              <span className={cn("text-[10px] font-semibold rounded border px-2 py-0.5 font-mono shrink-0", meta.color)}>
                {meta.label}
              </span>
              <span className="text-xs text-muted-foreground flex-1 truncate">
                Key: <span className="font-mono text-purple-400">{artifact.signing_key_hint}</span>
              </span>
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4">
                {/* Steps breakdown */}
                {artifact.steps && artifact.steps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Construction Steps
                    </p>
                    <div className="space-y-2">
                      {artifact.steps.map((step, si) => (
                        <div key={si} className="rounded border border-border bg-muted/10">
                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {si + 1}. {step.label}
                            </span>
                            <CopyButton text={step.value} />
                          </div>
                          <pre className="px-3 py-2 text-[11px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                            {step.value}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Signature Base String
                    </p>
                    <CopyButton text={artifact.raw_input} />
                  </div>
                  <pre className="rounded border border-border bg-muted/10 px-3 py-2 text-[11px] font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
                    {artifact.raw_input}
                  </pre>
                </div>

                {/* Signing key */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Signing Key
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded border border-border bg-muted/10 px-3 py-2 text-[11px] font-mono text-purple-400 break-all">
                      {artifact.signing_key_hint}
                    </code>
                    <CopyButton text={artifact.signing_key_hint} />
                  </div>
                </div>

                {/* Final output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Signature Output
                    </p>
                    <CopyButton text={artifact.final_output} />
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-[11px] font-mono text-orange-400 break-all">
                      {artifact.final_output}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
