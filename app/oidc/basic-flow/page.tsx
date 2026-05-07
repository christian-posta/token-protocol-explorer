import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oidc/scenarios/basic-flow.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OpenID Connect — Authorization Code Flow — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OpenID Connect Authorization Code flow with ID Token, nonce, at_hash, and UserInfo endpoint.",
};

export default function OidcBasicFlowPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
