import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/refresh-token.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 Refresh Token Grant — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 2.0 Refresh Token grant — silent renewal, token rotation, and refresh token family revocation on reuse.",
};

export default function Oauth2RefreshTokenPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
