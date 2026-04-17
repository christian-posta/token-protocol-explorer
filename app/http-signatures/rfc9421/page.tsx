import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/http-signatures/scenarios/rfc9421-basic.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "HTTP Message Signatures (RFC 9421) — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of RFC 9421 HTTP Message Signatures.",
};

export default function HttpSignaturesRfc9421Page() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
