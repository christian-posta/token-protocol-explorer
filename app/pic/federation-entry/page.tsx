import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/pic/scenarios/federation-entry.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "PIC: Federation Bridge Entry — Token Protocol Explorer",
  description:
    "Interactive visualization of how a PIC transaction starts: external OIDC credential mapped into PCA_0, the root of the causal authority chain.",
};

export default function PicFederationEntryPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
