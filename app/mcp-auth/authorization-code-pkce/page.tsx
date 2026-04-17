import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/mcp-auth/scenarios/authorization-code-pkce.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "MCP Auth — Authorization Code with PKCE — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the Model Context Protocol (MCP) authorization flow.",
};

export default function MCPAuthAuthorizationCodePKCEPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
