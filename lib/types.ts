// ─── Participants ─────────────────────────────────────────────────────────────

export type ParticipantType = "client" | "server" | "idp" | "kms" | "proxy" | "user";

export interface Participant {
  id: string;
  label: string;
  type: ParticipantType;
  port?: number;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

export interface DecodedToken {
  name: string;         // e.g. "Access Token", "DPoP Proof"
  typ: string;          // e.g. "at+jwt", "dpop+jwt"
  raw: string;          // Full JWT string
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature_b64: string;
}

// ─── Crypto Artifacts ─────────────────────────────────────────────────────────

export type CryptoArtifactType = "hmac-sha1" | "hmac-sha256" | "rsa-sha256" | "jwt" | "custom";

export interface CryptoArtifactStep {
  label: string;
  value: string;
}

export interface CryptoArtifact {
  type: CryptoArtifactType;
  raw_input: string;        // The full input to the hash/sign function (e.g. signature base string)
  signing_key_hint: string; // Human-readable key description (e.g. "consumer_secret&token_secret")
  final_output: string;     // The resulting signature/hash (base64 or hex)
  steps?: CryptoArtifactStep[]; // Step-by-step breakdown
}

// ─── Protocol Steps ──────────────────────────────────────────────────────────

export interface ProtocolStep {
  step: number;
  from: string;   // Participant ID
  to: string;     // Participant ID
  label: string;  // Short arrow label

  // HTTP layer
  method: string;
  url: string;
  request_headers: Record<string, string>;
  request_body?: unknown;
  response_status: number;
  response_headers: Record<string, string>;
  response_body?: unknown;

  // Protocol-specific
  artifacts: CryptoArtifact[];
  tokens: DecodedToken[];

  // Narrative
  explanation: string;
  annotations: string[];
  is_response?: boolean;
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

export interface Scenario {
  id: string;
  title: string;
  description: string;
  rfc?: string;
  specUrl?: string;
  relatedSpecs?: { label: string; url: string }[];
  category: string;
  participants: Participant[];
  steps: ProtocolStep[];
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  color: string;
  items: NavItem[];
}
