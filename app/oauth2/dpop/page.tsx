import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/dpop.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 DPoP — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 2.0 DPoP protocol flow.",
};

export default function Oauth2DpopPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
