"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Scenario } from "@/lib/types";
import { useScenarioStore } from "@/lib/store";
import { SequenceDiagram } from "@/components/core/SequenceDiagram";
import { HeaderInspector } from "@/components/core/HeaderInspector";
import { CryptoArtifactVisualizer } from "@/components/core/CryptoArtifactVisualizer";
import { JWTViewer } from "@/components/core/JWTViewer";
import { StepController } from "@/components/core/StepController";
import { cn } from "@/lib/utils";

interface ScenarioPageProps {
  scenario: Scenario;
}

export function ScenarioPage({ scenario }: ScenarioPageProps) {
  const { currentStep, setCurrentStep, reset } = useScenarioStore();

  useEffect(() => {
    reset();
  }, [scenario.id, reset]);

  const step = scenario.steps[currentStep];
  const stepLabels = scenario.steps.map((s) => s.label);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="border-b border-border px-6 py-4 shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold rounded px-2 py-0.5 uppercase tracking-wider text-orange-400 bg-orange-500/10">
                {scenario.category}
              </span>
            </div>
            <h1 className="text-xl font-bold">{scenario.title}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {scenario.description}
            </p>
          </div>
          {scenario.rfc && (
            <a
              href={`https://datatracker.ietf.org/doc/html/${scenario.rfc.toLowerCase().replace(" ", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {scenario.rfc}
            </a>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Sequence diagram + step controller */}
        <div className="flex flex-col border-r border-border w-full lg:w-[420px] xl:w-[520px] shrink-0">
          <div className="flex-1 overflow-auto p-6">
            <SequenceDiagram
              participants={scenario.participants}
              steps={scenario.steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>

          {/* Step info */}
          {step && (
            <div className="border-t border-border px-4 py-3 bg-muted/10 shrink-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground break-all min-w-0">
                  {step.method} {step.url}
                </span>
                <span
                  className={cn(
                    "ml-auto text-[10px] font-mono font-bold shrink-0",
                    step.response_status < 300
                      ? "text-green-400"
                      : step.response_status < 400
                      ? "text-blue-400"
                      : "text-amber-400"
                  )}
                >
                  {step.response_status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.explanation}
              </p>
              {step.annotations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {step.annotations.map((note, i) => (
                    <p key={i} className="text-xs text-muted-foreground/70 leading-relaxed">
                      • {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4 border-t border-border shrink-0">
            <StepController totalSteps={scenario.steps.length} stepLabels={stepLabels} />
          </div>
        </div>

        {/* Right: Detail panels */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-w-0">
          {step && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* HTTP Headers & Body */}
              <HeaderInspector
                method={step.method}
                url={step.url}
                requestHeaders={step.request_headers}
                responseHeaders={step.response_headers}
                requestBody={step.request_body}
                responseBody={step.response_body}
                responseStatus={step.response_status}
              />

              {/* Crypto Artifacts (HMAC-SHA1 signature breakdown) */}
              {step.artifacts && step.artifacts.length > 0 && (
                <CryptoArtifactVisualizer artifacts={step.artifacts} />
              )}

              {/* Tokens (Decoded JWTs) */}
              {step.tokens && step.tokens.length > 0 && (
                <div className="space-y-4">
                  {step.tokens.map((token, i) => (
                    <JWTViewer key={i} token={token} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
