import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/cb4a/scenarios/happy-path.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "CB4A Happy Path — Token Protocol Explorer",
  description:
    "Interactive visualization of the Credential Broker for Agents protocol (draft-hartman-cb4a-00). Watch how a PDP and CDP collaborate to issue short-lived, DPoP-bound tokens to AI agents without credential sprawl.",
};

export default function CB4AHappyPathPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
