import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/client-instance-assertion/scenarios/authz-code-delegation.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Client Instance Assertion: User Delegation — Token Protocol Explorer",
  description:
    "Interactive step-by-step visualization of the OAuth 2.0 Client Instance Assertion profile — authorization_code delegation flow with act claim.",
};

export default function ClientInstanceAuthzCodePage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
