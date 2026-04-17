import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/aws-sigv4/scenarios/api-request.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "AWS SigV4 API Request — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of an AWS SigV4 authenticated API request.",
};

export default function AwsSigv4ApiRequestPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
