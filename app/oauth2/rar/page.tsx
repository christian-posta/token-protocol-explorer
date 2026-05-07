import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/rar.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 Rich Authorization Requests (RAR) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of OAuth 2.0 RAR (RFC 9396) — fine-grained authorization with authorization_details replacing coarse scopes.",
};

export default function Oauth2RarPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
