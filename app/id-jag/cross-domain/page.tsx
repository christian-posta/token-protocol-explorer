import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/id-jag/scenarios/cross-domain.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "ID-JAG Cross-Domain Access (Xaa) — Token Protocol Explorer",
  description:
    "Interactive step-by-step visualization of the Identity Assertion Authorization Grant for cross-trust-domain access between ACME Corp and Xaa's partner API.",
};

export default function IdJagCrossDomainPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
