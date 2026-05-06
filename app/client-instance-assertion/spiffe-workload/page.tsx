import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/client-instance-assertion/scenarios/spiffe-workload.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Client Instance Assertion: SPIFFE Workload — Token Protocol Explorer",
  description:
    "Interactive visualization of SPIFFE JWT-SVID exchange for OAuth Client Instance Assertion via SPIRE Workload API re-minting.",
};

export default function ClientInstanceSpiffeWorkloadPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
