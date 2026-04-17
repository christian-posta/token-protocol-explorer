import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/token-exchange-delegation.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Token Exchange (Delegation) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of OAuth 2.0 Token Exchange for delegation.",
};

export default function Oauth2TokenExchangeDelegationPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
