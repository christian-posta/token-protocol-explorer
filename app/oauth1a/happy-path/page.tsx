import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/oauth1a/scenarios/happy-path.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "OAuth 1.0a Happy Path — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the OAuth 1.0a three-legged authorization flow with full HMAC-SHA1 signature breakdown.",
};

export default function OAuth1AHappyPathPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
