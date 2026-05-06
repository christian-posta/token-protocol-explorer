import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/client-instance-assertion/scenarios/client-credentials.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Client Instance Assertion: Self-Acting — Token Protocol Explorer",
  description:
    "Interactive step-by-step visualization of the OAuth 2.0 Client Instance Assertion profile — client_credentials (self-acting) flow.",
};

export default function ClientInstanceCredentialsPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
