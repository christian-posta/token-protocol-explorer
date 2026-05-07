import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/par.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 Pushed Authorization Requests (PAR) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of OAuth 2.0 PAR (RFC 9126) — pushing authorization requests server-to-server before the browser redirect.",
};

export default function Oauth2ParPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
