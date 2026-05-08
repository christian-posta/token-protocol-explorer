import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/pic/scenarios/ai-agent-orchestration.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "PIC: AI Agent Orchestration — Token Protocol Explorer",
  description:
    "Interactive visualization of an AI agent calling a tool under the origin user's authority — confused deputy non-formulable by construction.",
};

export default function PicAIAgentOrchestrationPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
