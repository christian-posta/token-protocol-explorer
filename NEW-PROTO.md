# Protocol Explorer Engine: Blueprint & Implementation Guide

This document outlines the architecture, design philosophy, and step-by-step implementation guidelines for building protocol explorers. It combines both the high-level vision and hands-on developer guidance needed to add new protocols to the Token Protocol Explorer.

---

## 1. The Core Idea

**"X-Ray Vision for Network Protocols"**

Reading RFCs and protocol specifications is notoriously dry and difficult. The Protocol Explorer Engine transforms static text into an interactive, step-by-step playback engine. Instead of reading about how a signature is generated or how a token is passed, the user *watches the bytes flow* and can inspect the cryptographic math at every single step.

**The Golden Rule:** The UI must be completely dumb. All protocol logic, network payloads, and cryptographic proofs must be defined in static JSON "Scenario" files. The UI is simply a media player for these JSON files.

```
JSON scenario file  →  generic rendering engine  →  interactive diagram
```

---

## 2. Theme & UX Design

The visual language should feel highly technical, trustworthy, and forensic.

- **Aesthetic:** "Modern Forensics" / Dark Mode Native. Think sleek developer tools, terminal interfaces, and network analyzers (like a modern Wireshark).
- **Typography:** Use a clean sans-serif (e.g., Inter, Geist) for UI, and heavily utilize Monospace (JetBrains Mono, Fira Code) for payloads, headers, and cryptographic strings.
- **Color Coding:** Color-code specific *types* of data, not just UI elements. Example: Keys/Secrets are always Purple, Signatures are Orange, Identifiers are Blue, Payloads are Green. This creates visual continuity when a key transforms into a signature.
- **Layout Structure (3-Pane):**
  1. **Left Sidebar:** Scenario selection and narrative text (explaining *why* this step happens).
  2. **Center Stage:** The animated Sequence/Topology diagram. Arrows physically move from Actor A to Actor B as the playhead advances.
  3. **Right Panel (The Inspector):** Context-aware deep dive. Clicking an arrow or a token here reveals raw Headers, decoded JWTs, or the mathematical breakdown of a signature.

---

## 3. The Generic Data Model

To support *any* protocol, the TypeScript/JSON schema must be heavily abstracted:

```typescript
// 1. Actors in the system
export interface Participant {
  id: string;
  label: string;
  type: "client" | "server" | "idp" | "kms" | "proxy" | "user";
  port?: number;
}

// 2. Cryptographic Proofs (The most important part for SigV4/OAuth 1.0a)
export interface CryptoArtifact {
  type: "hmac-sha1" | "hmac-sha256" | "rsa-sha256" | "jwt" | "custom";
  raw_input: string;       // e.g., The Canonical Request string
  signing_key_hint: string; // e.g., "AWS Secret Key" or "Client Secret"
  final_output: string;    // The resulting signature
  steps?: { label: string; value: string }[]; // Step-by-step math breakdown
}

// 3. The Step (A single frame of animation)
export interface ProtocolStep {
  step: number;
  from: string; // Participant ID
  to: string;   // Participant ID
  label: string; // Short text for the arrow (≤28 chars)

  // Network Layer
  method: string;
  url: string;
  request_headers: Record<string, string>;
  request_body?: any;
  response_status: number;
  response_headers: Record<string, string>;
  response_body?: any;

  // Contextual Payloads & Math
  artifacts: CryptoArtifact[];
  tokens: any[];

  // Narrative
  explanation: string;
  annotations: string[];

  // Optional: explicit response step
  is_response?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  rfc?: string;
  category: string;
  participants: Participant[];
  steps: ProtocolStep[];
}
```

---

## 4. Implementation Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **State Management:** Zustand (tracks `currentStep`, `isPlaying`, `playbackSpeed`)
- **Animation:** Framer Motion (sequence arrows animate from origin to destination)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Language:** TypeScript

### Core Components (Don't Touch)

These are in `components/core/`:

- **`SequenceDiagram`** — SVG sequence diagram with animated arrows
- **`StepController`** — Play/Pause/Next/Prev/scrubber timeline
- **`HeaderInspector`** — Request/response tabs with headers and body
- **`CryptoArtifactVisualizer`** — Cryptography details with step-by-step breakdown

---

## 5. Repository Architecture

```
token-protocol-explorer/
├── protocols/                          ← ALL protocol content lives here
│   └── [protocol-slug]/
│       ├── rfc####.txt                 ← RFC or spec document
│       └── scenarios/
│           └── [scenario-slug].json    ← JSON scenario file
├── app/                                ← Next.js App Router pages
│   ├── page.tsx                        ← EDIT: homepage protocol list
│   └── [protocol-slug]/
│       └── [scenario-slug]/
│           └── page.tsx                ← CREATE: boilerplate page
├── components/
│   ├── core/                           ← Rendering engine (DO NOT TOUCH)
│   │   ├── SequenceDiagram.tsx
│   │   ├── HeaderInspector.tsx
│   │   ├── CryptoArtifactVisualizer.tsx
│   │   └── StepController.tsx
│   ├── layout/
│   │   ├── AppShell.tsx                ← DO NOT TOUCH
│   │   └── Sidebar.tsx                 ← EDIT: nav registration
│   └── scenarios/
│       └── ScenarioPage.tsx            ← DO NOT TOUCH
├── lib/
│   ├── types.ts                        ← TypeScript types reference
│   ├── store.ts                        ← Zustand state (DO NOT TOUCH)
│   └── utils.ts                        ← Utilities (DO NOT TOUCH)
└── NEW-PROTO.md                        ← You are here
```

**Files you touch for every new protocol:**

| Action | File |
|--------|------|
| DOWNLOAD | `protocols/[proto]/rfc####.txt` |
| CREATE | `protocols/[proto]/scenarios/[scenario].json` |
| CREATE | `app/[proto]/[scenario]/page.tsx` |
| EDIT | `components/layout/Sidebar.tsx` |
| EDIT | `app/page.tsx` |

---

## 6. Step-by-Step Implementation Guide

### Step 0 — Download the Spec

Always store the authoritative specification document alongside the scenario JSON.

```
protocols/[protocol-slug]/
├── rfc####.txt          ← IETF RFC plain text (preferred)
├── spec.html            ← if no RFC exists, save canonical HTML
└── scenarios/
    └── [scenario].json
```

**Naming convention:**
- IETF RFCs: `rfc####.txt` (e.g., `rfc5849.txt`)
- W3C / other specs: `spec.txt` or `spec.html`

**How to download:**

```bash
# IETF RFC (always prefer plain text)
curl -s "https://www.rfc-editor.org/rfc/rfc5849.txt" \
     -o protocols/oauth1a/rfc5849.txt

# Non-RFC spec (HTML)
curl -s "https://spec.example.com/fooauth" \
     -o protocols/fooauth/spec.html
```

---

### Step 1 — Design Your Scenario JSON

Before writing JSON, sketch the protocol flow on paper:

#### A. Identify Participants

Participants are the actors in the sequence diagram. Each gets a swim lane.

| `type` value | Color | Use for |
|---|---|---|
| `"client"` | Orange | Consumer app, client application, relying party |
| `"server"` | Green | API server, resource server, backend service |
| `"idp"` | Purple | Identity provider, authorization server |
| `"kms"` | Red | Key management service, HSM, secrets manager |
| `"proxy"` | Sky blue | Reverse proxy, API gateway, load balancer |
| `"user"` | Amber | Human user, browser, user agent |

Pick the smallest set that clearly tells the story. 2–4 participants is ideal; >6 gets cramped.

#### B. Map Each Protocol Message to a Step

Each step is one arrow — typically one HTTP request and response. Decide whether to show responses implicitly (auto-generated dashed return arrow) or explicitly (dedicated step with `"is_response": true`).

#### C. Keep Labels Under 28 Characters

The arrow label is truncated at ~28 characters in the SVG diagram:

```
✅  "POST /oauth/initiate"
✅  "Redirect → /authorize"
❌  "Consumer sends signed POST request to the Service Provider's initiate endpoint"
```

#### D. Choose CryptoArtifactType

| `type` | Badge color | Use for |
|---|---|---|
| `"hmac-sha1"` | Yellow | OAuth 1.0a, legacy HMAC |
| `"hmac-sha256"` | Orange | AWS SigV4, OAuth 2.0 PKCE |
| `"rsa-sha256"` | Blue | JWT RS256, SAML, TLS certs |
| `"jwt"` | Indigo | JWT (HS256/RS256) |
| `"custom"` | Gray | Anything else or mixed signatures |

Only include a `CryptoArtifact` on a step if that step actually involves cryptography.

---

### Step 2 — Create the Scenario JSON File

**File path:** `protocols/[protocol-slug]/scenarios/[scenario-slug].json`

Example: `protocols/fooauth/scenarios/happy-path.json`

Use lowercase kebab-case for both slugs.

#### Full Annotated Schema

```jsonc
{
  // Unique identifier. Convention: "[protocol-slug]-[scenario-slug]"
  "id": "fooauth-happy-path",

  // Page title and scenario heading
  "title": "FooAuth — Happy Path",

  // Subtitle (one to two sentences)
  "description": "The complete FooAuth authorization flow...",

  // Optional RFC badge (e.g., "RFC 9999")
  "rfc": "RFC 9999",

  // Grouping label for navigation
  "category": "FooAuth",

  // Array of participants (swim lanes), left-to-right order
  "participants": [
    {
      "id": "client",
      "label": "Client App",
      "type": "client",
      "port": 3000  // Optional
    },
    {
      "id": "user",
      "label": "User / Browser",
      "type": "user"
    },
    {
      "id": "authz-server",
      "label": "Authorization Server",
      "type": "idp"
    }
  ],

  // Ordered array of protocol steps (1-based, sequential)
  "steps": [
    {
      "step": 1,
      "from": "client",
      "to": "authz-server",
      "label": "POST /fooauth/authorize",

      // HTTP Request
      "method": "POST",
      "url": "https://auth.example.com/fooauth/authorize",
      "request_headers": {
        "Authorization": "FooAuth client_id=\"abc123\", signature=\"xyz\"",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "auth.example.com"
      },
      "request_body": null,

      // HTTP Response (arrow color: 2xx=green, 3xx=blue, 4xx/5xx=red)
      "response_status": 200,
      "response_headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "response_body": "code=AUTH_CODE_HERE&expires_in=600",

      // Cryptographic artifacts ([] if none)
      "artifacts": [
        {
          "type": "hmac-sha256",
          "raw_input": "POST&https%3A%2F%2Fauth.example.com%2Ffooauth%2Fauthorize&...",
          "signing_key_hint": "client_secret (plain, not URL-encoded)",
          "final_output": "Base64EncodedSignatureHere==",
          "steps": [
            {
              "label": "1. Build String to Sign",
              "value": "POST\\nauth.example.com\\n/fooauth/authorize\\nclient_id=abc123&timestamp=..."
            },
            {
              "label": "2. Compute HMAC-SHA256",
              "value": "HMAC-SHA256(client_secret, string_to_sign) → raw bytes → Base64\\n→ Base64EncodedSignatureHere=="
            }
          ]
        }
      ],

      // Tokens issued/consumed in this step ([] if none)
      "tokens": [],

      // What is happening? (1–3 sentences)
      "explanation": "The client sends a signed authorization request to the FooAuth server. The request is signed with HMAC-SHA256 using the client_secret. The server validates the signature before issuing an authorization code.",

      // Spec references and implementation notes (bullet points)
      "annotations": [
        "The string-to-sign must be built in exactly this order: method, host, path, sorted params.",
        "RFC 9999 §3.1 — the timestamp must be within 300 seconds of the server's clock.",
        "Common mistake: forgetting to percent-encode the URL before including it in the base string."
      ],

      // Set to true ONLY on explicit response steps
      "is_response": false
    }
    // ... additional steps
  ]
}
```

#### HTTP Status Code → Arrow Color

| Range | Color |
|---|---|
| 2xx | Green |
| 3xx | Blue |
| 4xx | Red |
| 5xx | Red |

#### `explanation` vs `annotations`

| Field | Purpose | Style |
|---|---|---|
| `explanation` | What's happening in this step | Prose, 1–3 sentences, present tense |
| `annotations` | Spec details, gotchas, RFC cites | Bullet points |

Put the "story" in `explanation`. Put the "fine print" in `annotations`.

---

### Step 3 — Create the Next.js Page

**File path:** `app/[protocol-slug]/[scenario-slug]/page.tsx`

Example: `app/fooauth/happy-path/page.tsx`

The directory structure **must exactly match** the slugs in the JSON file path.

```typescript
import { ScenarioPage } from "@/components/scenarios/ScenarioPage";
import scenarioData from "@/protocols/fooauth/scenarios/happy-path.json";
import { Scenario } from "@/lib/types";

export const metadata = {
  title: "FooAuth Happy Path — Token Protocol Explorer",
  description: "Interactive step-by-step visualization of the FooAuth authorization flow.",
};

export default function FooAuthHappyPathPage() {
  return <ScenarioPage scenario={scenarioData as unknown as Scenario} />;
}
```

**Why `as unknown as Scenario`?**

TypeScript infers JSON imports as deeply literal types. The `Scenario` interface uses union types. The double cast bypasses the structural mismatch without widening the JSON type. This is safe because the JSON is validated at build time by TypeScript.

---

### Step 4 — Register in Sidebar Navigation

**File:** `components/layout/Sidebar.tsx`

Find the `NAV` array near the top of the file and append a new `NavSection` object:

```typescript
const NAV: NavSection[] = [
  {
    title: "OAuth 1.0a",
    color: "text-orange-400",
    items: [
      { label: "Happy Path (3-legged flow)", href: "/oauth1a/happy-path" },
    ],
  },
  // ↓ Add your new protocol here
  {
    title: "FooAuth",
    color: "text-blue-400",
    items: [
      {
        label: "Happy Path",
        href: "/fooauth/happy-path",
      },
    ],
  },
];
```

**Color naming convention:** Use a single Tailwind color family per protocol (e.g., all `blue-*`). Match this with the `accent` and `iconWrap` on the homepage card in Step 5.

---

### Step 5 — Register on Home Page

**File:** `app/page.tsx`

Find the `PROTOCOLS` array near the top of the file and append a new entry:

```typescript
const PROTOCOLS = [
  {
    id: "oauth1a",
    // ... existing OAuth 1.0a entry
  },
  // ↓ Add your new protocol here
  {
    id: "fooauth",
    name: "FooAuth",
    rfc: "RFC 9999",
    rfcUrl: "https://datatracker.ietf.org/doc/html/rfc9999",
    accent: "border-blue-500/35 hover:border-blue-500/55",
    iconWrap: "bg-blue-500/15 text-blue-400",
    description:
      "FooAuth is a modern authorization protocol using HMAC-SHA256 signed requests. Clients obtain authorization codes and exchange them for bearer tokens to access protected resources.",
    scenarios: [
      {
        label: "Happy Path",
        href: "/fooauth/happy-path",
      },
    ],
  },
];
```

#### Tailwind Color Pairing Guide

Choose a consistent color family and use it across all three registration points:

| Color | Sidebar `color` | Card `accent` | Card `iconWrap` |
|---|---|---|---|
| Orange | `text-orange-400` | `border-orange-500/35 hover:border-orange-500/55` | `bg-orange-500/15 text-orange-400` |
| Blue | `text-blue-400` | `border-blue-500/35 hover:border-blue-500/55` | `bg-blue-500/15 text-blue-400` |
| Green | `text-green-400` | `border-green-500/35 hover:border-green-500/55` | `bg-green-500/15 text-green-400` |
| Purple | `text-purple-400` | `border-purple-500/35 hover:border-purple-500/55` | `bg-purple-500/15 text-purple-400` |
| Sky | `text-sky-400` | `border-sky-500/35 hover:border-sky-500/55` | `bg-sky-500/15 text-sky-400` |
| Indigo | `text-indigo-400` | `border-indigo-500/35 hover:border-indigo-500/55` | `bg-indigo-500/15 text-indigo-400` |
| Teal | `text-teal-400` | `border-teal-500/35 hover:border-teal-500/55` | `bg-teal-500/15 text-teal-400` |
| Rose | `text-rose-400` | `border-rose-500/35 hover:border-rose-500/55` | `bg-rose-500/15 text-rose-400` |

**Current assignments:**
- Orange → OAuth 1.0a

Avoid reusing a color family already assigned to another protocol.

---

## 7. Complete Worked Example

A minimal but complete scenario for a fictional **FooAuth** protocol with 3 steps:

`protocols/fooauth/scenarios/happy-path.json`:

```json
{
  "id": "fooauth-happy-path",
  "title": "FooAuth — Happy Path",
  "description": "Three-step FooAuth flow: client requests an authorization code, user grants consent, client exchanges the code for an access token.",
  "rfc": "RFC 9999",
  "category": "FooAuth",
  "participants": [
    { "id": "client", "label": "Client App", "type": "client" },
    { "id": "user", "label": "User / Browser", "type": "user" },
    { "id": "authz", "label": "Auth Server", "type": "idp" }
  ],
  "steps": [
    {
      "step": 1,
      "from": "client",
      "to": "authz",
      "label": "POST /fooauth/authorize",
      "method": "POST",
      "url": "https://auth.example.com/fooauth/authorize",
      "request_headers": {
        "Authorization": "FooAuth client_id=\"abc\", signature=\"SIG\"",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "auth.example.com"
      },
      "request_body": "client_id=abc&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb",
      "response_status": 200,
      "response_headers": { "Content-Type": "application/json" },
      "response_body": { "code": "AUTH_CODE_XYZ", "expires_in": 600 },
      "artifacts": [
        {
          "type": "hmac-sha256",
          "raw_input": "POST\\nauth.example.com\\n/fooauth/authorize\\nclient_id=abc&redirect_uri=...",
          "signing_key_hint": "client_secret (registered with auth server)",
          "final_output": "Base64HMACOutputHere==",
          "steps": [
            {
              "label": "1. Build String to Sign",
              "value": "POST\\nauth.example.com\\n/fooauth/authorize\\nclient_id=abc&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb"
            },
            {
              "label": "2. Compute HMAC-SHA256",
              "value": "HMAC-SHA256(client_secret, string_to_sign) → raw bytes → Base64\\n→ Base64HMACOutputHere=="
            }
          ]
        }
      ],
      "tokens": [],
      "explanation": "The client sends a signed authorization request. The signature proves the request originates from the registered client. The server validates the signature and returns a short-lived authorization code.",
      "annotations": [
        "The string-to-sign is: HTTP method + newline + host + newline + path + newline + sorted query params.",
        "RFC 9999 §2.1 — the authorization code expires in 600 seconds.",
        "The redirect_uri must exactly match the URI registered with the authorization server."
      ]
    },
    {
      "step": 2,
      "from": "client",
      "to": "user",
      "label": "Redirect → /grant",
      "method": "GET",
      "url": "https://auth.example.com/grant?code=AUTH_CODE_XYZ",
      "request_headers": {},
      "request_body": null,
      "response_status": 302,
      "response_headers": { "Location": "https://auth.example.com/grant?code=AUTH_CODE_XYZ" },
      "response_body": null,
      "artifacts": [],
      "tokens": [],
      "explanation": "The client redirects the user's browser to the authorization server's consent page, passing the authorization code as a query parameter. No signature is required for this redirect.",
      "annotations": [
        "The user must be authenticated with the authorization server before the consent page is shown.",
        "If the user is already logged in, this step may be transparent (instant redirect)."
      ]
    },
    {
      "step": 3,
      "from": "client",
      "to": "authz",
      "label": "POST /fooauth/token",
      "method": "POST",
      "url": "https://auth.example.com/fooauth/token",
      "request_headers": {
        "Authorization": "FooAuth client_id=\"abc\", code=\"AUTH_CODE_XYZ\", signature=\"SIG2\"",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "auth.example.com"
      },
      "request_body": "grant_type=authorization_code&code=AUTH_CODE_XYZ",
      "response_status": 200,
      "response_headers": { "Content-Type": "application/json" },
      "response_body": {
        "access_token": "ACCESS_TOKEN_HERE",
        "token_type": "bearer",
        "expires_in": 3600
      },
      "artifacts": [],
      "tokens": [],
      "explanation": "The client exchanges the authorization code for a long-lived access token. The code can only be used once. On success, the server returns a bearer token the client can use to access protected resources.",
      "annotations": [
        "RFC 9999 §3.2 — the authorization code is invalidated after this exchange.",
        "The access token should be stored securely and never logged.",
        "If the code has expired or was already used, the server returns 400 Bad Request."
      ]
    }
  ]
}
```

---

## 8. Verification Checklist

After adding a protocol, verify each item:

- [ ] Spec document saved to `protocols/[proto]/rfc####.txt` (or equivalent)
- [ ] JSON is valid (no syntax errors) — run `npm run build`
- [ ] All `from`/`to` IDs in `steps` match IDs in the `participants` array
- [ ] All `step` numbers are sequential starting from 1
- [ ] All steps have `"artifacts": []` or valid artifacts array (never omitted)
- [ ] All steps have `"tokens": []` or valid tokens array (never omitted)
- [ ] Sequence diagram renders correct number of arrows (one per step)
- [ ] StepController shows correct total step count (e.g., "Step 1 of 7")
- [ ] Play mode auto-advances through all steps and stops at the last
- [ ] Keyboard left/right arrows navigate between steps
- [ ] Clicking a sequence diagram arrow jumps to that step
- [ ] HeaderInspector shows Request and Response tabs with correct data
- [ ] CryptoArtifactVisualizer drawer opens/closes on steps with artifacts
- [ ] Copy buttons in the artifact drawer work
- [ ] Sidebar link highlights when on the correct route
- [ ] Home page card appears with correct name, description, and RFC badge
- [ ] Scenario link buttons on the home page card navigate to the correct route
- [ ] RFC badge link opens the correct spec URL in a new tab
- [ ] `npm run build` passes with no TypeScript errors

---

## 9. Troubleshooting Common Mistakes

### `from`/`to` IDs don't match participant IDs → arrows break

The sequence diagram silently fails to render arrows when participant IDs don't match. Double-check that every `from` and `to` value exactly matches one of the `id` fields in the `participants` array (case-sensitive).

```json
// ❌ Typo — participant ID is "authz-server" but step says "authz_server"
{ "from": "client", "to": "authz_server" }

// ✅ Exact match
{ "from": "client", "to": "authz-server" }
```

### `label` too long → truncated in diagram

The SVG arrow label is clipped at ~28 characters. If your label is longer, abbreviate it:

```json
"label": "POST /oauth/initiate"          // ✅ 21 chars
"label": "POST /very/long/endpoint/path" // ❌ 33 chars — will be clipped
```

### Missing `artifacts: []` or `tokens: []` → runtime error

These fields are required on every step. Omitting them causes a runtime crash.

```json
// ❌ Missing — will crash
{ "step": 2, "from": "a", "to": "b", "label": "...", ... }

// ✅ Correct
{ "step": 2, "from": "a", "to": "b", "label": "...", "artifacts": [], "tokens": [], ... }
```

### Missing `annotations: []` → potential render issue

Include `[]` explicitly to be safe and consistent:

```json
"annotations": [],  // ✅ Even if empty, always include
```

### `request_body: null` vs omitting the field

Both are acceptable — `null` renders as an empty body tab. However, explicitly setting `"request_body": null` is preferred, as it makes intent clear.

### Wrong `CryptoArtifact` type → wrong badge color

Using `"type": "custom"` on an HMAC-SHA256 step won't crash, but the badge will appear gray instead of orange. Match the type to the actual algorithm used.

### Route mismatch between page.tsx path and sidebar/homepage href

If `app/fooauth/happy-path/page.tsx` exists but the sidebar uses `href: "/fooauth/happypath"` (missing hyphen), the nav link will 404. Ensure the directory name, sidebar href, and homepage href are identical:

```
app/fooauth/happy-path/page.tsx   ← directory path
href: "/fooauth/happy-path"        ← sidebar and homepage (must match)
```

### TypeScript build error on JSON import

Ensure the cast is exactly:

```typescript
scenarioData as unknown as Scenario
```

Not `scenarioData as Scenario` (direct cast fails) and not omitting the cast entirely.

### Scenario not appearing in sidebar

The sidebar reads from the static `NAV` array at module load time. After editing `Sidebar.tsx`, the dev server hot-reloads automatically, but verify the entry was added to the correct `NAV` array (at the top of the file, not inside a component).

---

## 10. AI Generation Prompt

When you are ready to build a new protocol explorer, hand an AI this exact prompt along with this document:

> "I want to build an interactive Protocol Explorer Engine for **[INSERT PROTOCOL HERE, e.g., AWS SigV4]**.
>
> Please read the architecture guidelines in the provided `NEW-PROTO.md` file.
>
> Your first task is to design the JSON data schema required to represent this specific protocol's network requests and cryptographic signatures, heavily inspired by the generic model in the doc.
>
> Your second task is to write a complete mock `scenario.json` file for a standard, happy-path flow of this protocol. Ensure the JSON deeply details the exact cryptographic inputs (like Canonical Requests, String-to-Sign, and final HMAC signatures) so we can visualize the math step-by-step.
>
> Finally, scaffold the Next.js/Zustand application that plays this JSON back frame-by-frame."

---

## 11. Summary: "2 Files + 2 Edits" Rule

Adding a new protocol is straightforward:

1. **Create** `protocols/[proto]/scenarios/[scenario].json` (the JSON scenario)
2. **Create** `app/[proto]/[scenario]/page.tsx` (the Next.js page)
3. **Edit** `components/layout/Sidebar.tsx` (add nav entry)
4. **Edit** `app/page.tsx` (add homepage card)

No component code changes needed. All protocol logic lives in the JSON.
