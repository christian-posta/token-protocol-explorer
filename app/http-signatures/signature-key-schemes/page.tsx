import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/http-signatures/scenarios/signature-key-schemes.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "Signature-Key Header — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the HTTP Signature-Key header schemes.",
};

export default function HttpSignaturesSignatureKeyPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
