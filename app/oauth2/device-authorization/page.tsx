import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth2/scenarios/device-authorization.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 2.0 Device Authorization Grant — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 2.0 Device Authorization Grant (RFC 8628) for CLIs, smart TVs, and IoT devices.",
};

export default function Oauth2DeviceAuthorizationPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
