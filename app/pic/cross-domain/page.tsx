import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/pic/scenarios/cross-domain.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "PIC: Cross-Domain Federation — Token Protocol Explorer",
  description:
    "Interactive visualization of cross-domain PIC: ingress bridge re-anchors authority across organizational trust boundaries while preserving p_0 and monotonicity.",
};

export default function PicCrossDomainPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
