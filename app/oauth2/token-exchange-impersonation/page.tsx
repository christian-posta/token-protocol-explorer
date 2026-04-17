import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/token-exchange-impersonation.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Token Exchange (Impersonation) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of OAuth 2.0 Token Exchange for impersonation.",
};

export default function Oauth2TokenExchangeImpersonationPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
