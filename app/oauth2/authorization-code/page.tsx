import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/authorization-code.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 Authorization Code + PKCE — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 2.0 Authorization Code grant with PKCE.",
};

export default function Oauth2AuthorizationCodePage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
