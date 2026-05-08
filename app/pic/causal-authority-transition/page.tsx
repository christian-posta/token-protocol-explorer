import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/pic/scenarios/causal-authority-transition.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "PIC: Causal Authority Transition — Token Protocol Explorer",
  description:
    "Interactive visualization of the canonical PIC single-hop flow: PCC challenge, PoC construction, monotonicity validation, and PCA minting.",
};

export default function PicCausalAuthorityTransitionPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
