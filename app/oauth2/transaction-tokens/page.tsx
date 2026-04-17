import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/transaction-tokens.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Transaction Tokens (Draft) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 2.0 Transaction Tokens draft flow.",
};

export default function Oauth2TransactionTokensPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
