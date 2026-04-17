# Developer Guidance: Adding New Protocols

> **TL;DR** — A new protocol is 2 new files + 2 small edits. No component code changes needed.

---

## 1. Overview

Token Protocol Explorer is a **data-driven protocol media player**. You write JSON; the UI renders it.

```
JSON scenario file  →  generic rendering engine  →  interactive diagram
```

The UI components (`SequenceDiagram`, `HeaderInspector`, `CryptoArtifactVisualizer`, `StepController`) know nothing about OAuth, SAML, or any specific protocol. They only know how to render a `Scenario` object. All protocol logic, all step ordering, all cryptographic detail lives in the JSON file you write.

**You never need to touch a component to add a new protocol.**

---

## 2. Repository Architecture

```
token-protocol-explorer/
│
├── protocols/                          ← ALL protocol content lives here
│   └── [protocol-slug]/
│       └── scenarios/
│           └── [scenario-slug].json    ← PRIMARY: you create this
│
├── app/                                ← Next.js App Router pages
│   ├── page.tsx                        ← EDIT: homepage protocol card list
│   └── [protocol-slug]/
│       └── [scenario-slug]/
│           └── page.tsx                ← CREATE: one-shot boilerplate
│
├── components/
│   ├── core/                           ← Rendering engine — DO NOT TOUCH
│   │   ├── SequenceDiagram.tsx         │  SVG sequence diagram
│   │   ├── HeaderInspector.tsx         │  Request/response panel
│   │   ├── CryptoArtifactVisualizer.tsx│  Crypto artifact drawer
│   │   └── StepController.tsx         ─┘  Play/Pause/Step controls
│   ├── layout/
│   │   ├── AppShell.tsx                ← DO NOT TOUCH
│   │   └── Sidebar.tsx                 ← EDIT: nav registration
│   └── scenarios/
│       └── ScenarioPage.tsx            ← DO NOT TOUCH
│
├── lib/
│   ├── types.ts                        ← TypeScript contract — read this
│   ├── store.ts                        ← Zustand state — DO NOT TOUCH
│   └── utils.ts                        ← Utilities — DO NOT TOUCH
│
└── GUIDANCE.md                         ← You are here
```

**Files you touch for every new protocol:**

| Action | File |
|--------|------|
| DOWNLOAD | `protocols/[proto]/[rfc-or-spec].txt` (or `.html`) |
| CREATE | `protocols/[proto]/scenarios/[scenario].json` |
| CREATE | `app/[proto]/[scenario]/page.tsx` |
| EDIT   | `components/layout/Sidebar.tsx` |
| EDIT   | `app/page.tsx` |

---

## 3. Step-by-Step Instructions

### Step 0 — Download the Spec into the Protocol Folder

**Always** store the authoritative specification document alongside the scenario JSON. This keeps the protocol folder self-contained and gives future developers an offline reference that matches what the scenario was built against.

```
protocols/[protocol-slug]/
├── rfc####.txt          ← IETF RFC plain text (preferred)
├── spec.html            ← if no RFC exists, save the canonical HTML spec
└── scenarios/
    └── [scenario].json
```

**Naming convention:**
- IETF RFCs: `rfc####.txt` (e.g., `rfc5849.txt`, `rfc6749.txt`)
- W3C / other specs with no RFC number: `spec.txt` or `spec.html`
- When given a URL to a spec, save it under whatever filename fits the above convention

**How to download:**

```bash
# IETF RFC (always prefer the plain text canonical form)
curl -s "https://www.rfc-editor.org/rfc/rfc5849.txt" \
     -o protocols/oauth1a/rfc5849.txt

# Non-RFC spec (HTML)
curl -s "https://spec.example.com/fooauth" \
     -o protocols/fooauth/spec.html
```

This step applies to **any** spec source — RFC, W3C recommendation, vendor spec, GitHub repo README, NIST document, or any other authoritative reference the developer provides. Save it verbatim; do not summarize.

---

### Step 1 — Design Your Scenario JSON

Before writing any JSON, sketch the protocol flow on paper:

**A. Identify participants**

Participants are the actors in the sequence diagram. Each gets a swim lane.

| `type` value | Color in diagram | Use for |
|---|---|---|
| `"client"` | Orange | Consumer app, client application, relying party |
| `"server"` | Green | API server, resource server, backend service |
| `"idp"` | Purple | Identity provider, authorization server, IdP |
| `"kms"` | Red | Key management service, HSM, secrets manager |
| `"proxy"` | Sky blue | Reverse proxy, API gateway, load balancer |
| `"user"` | Amber | Human user, browser, user agent |

Pick the smallest set of participants that clearly tells the story. 2–4 is ideal; >6 gets cramped.

**B. Map each protocol message to a step**

Each step is one arrow in the sequence diagram — typically one HTTP request (and its response). For redirects or user interactions with no direct HTTP, model them as their own step.

Decide whether to show responses as implicit (the auto-generated dashed return arrow) or explicit (a dedicated step with `"is_response": true`). Use explicit response steps only when the response carries important data you want to highlight in detail.

**C. Keep `label` under 28 characters**

The arrow label is truncated in the SVG diagram at ~28 characters. Use concise labels:

```
✅  "POST /oauth/initiate"
✅  "Redirect → /authorize"
✅  "GET /api/resource"
❌  "Consumer sends signed POST request to the Service Provider's initiate endpoint"
```

**D. Choose `CryptoArtifactType`**

| `type` value | Badge color | Use for |
|---|---|---|
| `"hmac-sha1"` | Yellow | OAuth 1.0a, legacy HMAC |
| `"hmac-sha256"` | Orange | AWS SigV4, OAuth 2.0 PKCE |
| `"rsa-sha256"` | Blue | JWT RS256, SAML assertions, TLS client certs |
| `"jwt"` | Indigo | JWT (HS256/RS256 depending on alg field) |
| `"custom"` | Gray | Anything else, or mixed/composite signatures |

Only include a `CryptoArtifact` on a step if that step actually involves a cryptographic operation. Steps that are pure redirects or UI interactions should have `"artifacts": []`.

---

### Step 2 — Create the Scenario JSON File

**File path:** `protocols/[protocol-slug]/scenarios/[scenario-slug].json`

Example: `protocols/fooauth/scenarios/happy-path.json`

Use lowercase kebab-case for both slugs. The slug becomes the URL path segment.

#### Full Annotated Schema

```jsonc
{
  // Unique identifier for this scenario. Convention: "[protocol-slug]-[scenario-slug]"
  // Used internally; not displayed in the UI.
  "id": "fooauth-happy-path",

  // Displayed as the page title and scenario heading.
  "title": "FooAuth — Happy Path",

  // Displayed below the title. One to two sentences describing what this scenario shows.
  "description": "The complete FooAuth authorization flow. Client obtains an authorization code, exchanges it for an access token, and makes a signed API call.",

  // Optional. Displayed as a badge next to the title with a link.
  // If present, also add rfcUrl in app/page.tsx.
  "rfc": "RFC 9999",

  // Grouping label. Matches the protocol name used in navigation.
  "category": "FooAuth",

  // Array of participants (swim lanes). Order determines left-to-right column order.
  "participants": [
    {
      // Must be unique within this scenario. Used in step "from"/"to" fields.
      "id": "client",
      // Displayed in the swim lane header. Keep under ~20 chars.
      "label": "Client App",
      // Controls swim lane color. See participant type table above.
      "type": "client",
      // Optional. Displayed in the swim lane header below the label.
      "port": 3000
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

  // Ordered array of protocol steps. step numbers must start at 1 and be sequential.
  "steps": [
    {
      // Must match the index position (1-based). Used by StepController.
      "step": 1,

      // Participant IDs. Must exactly match an id in the participants array.
      "from": "client",
      "to": "authz-server",

      // Short label displayed on the sequence diagram arrow. Keep under 28 chars.
      "label": "POST /fooauth/authorize",

      // ── HTTP Request ─────────────────────────────────────────────────────
      "method": "POST",
      "url": "https://auth.example.com/fooauth/authorize",

      // Request headers as key-value pairs. Include only headers relevant to the protocol.
      "request_headers": {
        "Authorization": "FooAuth client_id=\"abc123\", signature=\"xyz\"",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "auth.example.com"
      },

      // Request body. Use null for requests with no body (GET, redirects).
      // Use a string for form-encoded or plain text bodies.
      // Use an object/array for JSON bodies — they will be pretty-printed.
      "request_body": null,

      // ── HTTP Response ────────────────────────────────────────────────────
      // Controls arrow color: 2xx=green, 3xx=blue, 4xx=red, 5xx=red
      "response_status": 200,

      "response_headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      // Response body. Same rules as request_body.
      "response_body": "code=AUTH_CODE_HERE&expires_in=600",

      // ── Cryptographic Artifacts ──────────────────────────────────────────
      // Array of crypto artifacts for this step. Use [] if no crypto is involved.
      // NEVER omit this field — it will cause a runtime error.
      "artifacts": [
        {
          // Controls the badge color. See CryptoArtifactType table above.
          "type": "hmac-sha256",

          // The complete input string passed to the hash/sign function.
          // For HMAC: the message. For RSA: the data being signed.
          "raw_input": "POST&https%3A%2F%2Fauth.example.com%2Ffooauth%2Fauthorize&...",

          // Human-readable description of the signing key. Not the actual secret.
          "signing_key_hint": "client_secret (plain, not URL-encoded)",

          // The final output: base64-encoded signature or hex hash.
          "final_output": "Base64EncodedSignatureHere==",

          // Optional but recommended. Step-by-step breakdown shown in the artifact drawer.
          // Each step shows one transformation in the signing process.
          "steps": [
            {
              "label": "1. Build String to Sign",
              "value": "POST\nauth.example.com\n/fooauth/authorize\nclient_id=abc123&timestamp=..."
            },
            {
              "label": "2. Compute HMAC-SHA256",
              "value": "HMAC-SHA256(client_secret, string_to_sign) → raw bytes → Base64\n→ Base64EncodedSignatureHere=="
            }
          ]
        }
      ],

      // Array of token objects. Use [] if no tokens are issued/consumed in this step.
      // NEVER omit this field — it will cause a runtime error.
      "tokens": [],

      // ── Narrative ────────────────────────────────────────────────────────

      // What is happening in this step? One to three sentences.
      // Focus on the "what" and "why" — mechanics visible to a developer.
      // This appears in the left panel below the step header.
      "explanation": "The client sends a signed authorization request to the FooAuth server. The request is signed with HMAC-SHA256 using the client_secret. The server validates the signature before issuing an authorization code.",

      // Array of strings. Spec references, gotchas, implementation notes.
      // These appear as bullet points in the left panel.
      // Great for RFC section citations, common mistakes, and edge cases.
      // Use [] if you have no annotations — NEVER omit the field.
      "annotations": [
        "The string-to-sign must be built in exactly this order: method, host, path, sorted params.",
        "RFC 9999 §3.1 — the timestamp must be within 300 seconds of the server's clock.",
        "Common mistake: forgetting to percent-encode the URL before including it in the base string."
      ],

      // Optional boolean. Set to true ONLY on a step that is an explicit HTTP response
      // (i.e., a step going back from server to client that you want to model separately
      // from the auto-generated dashed return arrow).
      // When true, this step is drawn as a dashed return arrow and the auto-return is suppressed.
      // Omit this field entirely (or set to false) for normal request steps.
      "is_response": false
    }

    // ... additional steps
  ]
}
```

#### Status Code → Arrow Color Reference

| Range | Color | Examples |
|---|---|---|
| 2xx | Green solid | 200 OK, 201 Created |
| 3xx | Blue solid | 302 Found, 301 Moved |
| 4xx | Red solid | 400 Bad Request, 401 Unauthorized |
| 5xx | Red solid | 500 Internal Server Error |

#### `explanation` vs `annotations` — When to Use Each

| Field | Purpose | Style |
|---|---|---|
| `explanation` | Narrative of what's happening in this step | Prose, 1–3 sentences, present tense |
| `annotations` | Spec details, gotchas, and implementation notes | Bullet points, can cite RFC sections |

Put the "story" in `explanation`. Put the "fine print" in `annotations`.

#### Modeling Response Steps Explicitly

By default, each step renders as a solid forward arrow. The sequence diagram automatically draws a dashed return arrow going back to the originating participant.

Use `"is_response": true` on a step when:
- The response carries important data you want to model in full detail (headers, body, crypto)
- You want the user to explicitly "step through" the response as its own event

When `is_response` is true, the step is drawn as a dashed arrow and suppresses the auto-return arrow.

---

### Step 3 — Create the Next.js Page

**File path:** `app/[protocol-slug]/[scenario-slug]/page.tsx`

Example: `app/fooauth/happy-path/page.tsx`

The directory structure **must exactly match** the slugs you used in the JSON file path and that you'll use in Sidebar/homepage links.

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

TypeScript infers JSON imports as deeply literal types (e.g., `"client"` instead of `string`). The `Scenario` interface uses union types like `ParticipantType`. The double cast (`as unknown as Scenario`) bypasses the structural mismatch without widening the JSON type. This is safe because the JSON is validated at build time by TypeScript.

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
    // Protocol name as displayed in the sidebar.
    title: "FooAuth",
    // Tailwind text color class. Match the protocol's theme color.
    // Use the same color family as the accent color you'll use on the homepage card.
    color: "text-blue-400",
    items: [
      {
        // Scenario name displayed in the sidebar nav item.
        label: "Happy Path",
        // Must exactly match the app/ directory path you created in Step 3.
        href: "/fooauth/happy-path",
      },
      // Add more scenario items here as you add more scenarios for this protocol.
    ],
  },
];
```

**`defaultOpen` behavior:** The `SidebarSection` component auto-opens a section if the current URL matches any of its `href` values. You don't need to set this manually — it's computed from `usePathname()`.

**Color naming convention:** Use a single Tailwind color family per protocol (e.g., all `blue-*`). Match the color you choose here with the `accent` and `iconWrap` on the homepage card in Step 5.

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
    // Used as the React key. Must be unique. Use the protocol slug.
    id: "fooauth",

    // Displayed as the card title.
    name: "FooAuth",

    // RFC identifier displayed as a badge. Match what's in your JSON "rfc" field.
    rfc: "RFC 9999",

    // The RFC spec URL. Opens in a new tab when the badge is clicked.
    rfcUrl: "https://datatracker.ietf.org/doc/html/rfc9999",

    // Tailwind classes for card border. Use the same color family as your sidebar color.
    // Pattern: "border-[color]-500/35 hover:border-[color]-500/55"
    accent: "border-blue-500/35 hover:border-blue-500/55",

    // Tailwind classes for the icon background + icon color.
    // Pattern: "bg-[color]-500/15 text-[color]-400"
    iconWrap: "bg-blue-500/15 text-blue-400",

    // 2–3 sentence description of the protocol. Displayed in the card body.
    description:
      "FooAuth is a modern authorization protocol using HMAC-SHA256 signed requests. Clients obtain authorization codes and exchange them for bearer tokens to access protected resources.",

    // Scenario links displayed as buttons at the bottom of the card.
    scenarios: [
      {
        label: "Happy Path",
        // Must exactly match the app/ directory path you created in Step 3.
        href: "/fooauth/happy-path",
      },
    ],
  },
];
```

#### Tailwind Color Pairing Guide

Choose a consistent color family and use it across `color` (sidebar), `accent`, and `iconWrap`:

| Color family | Sidebar `color` | Card `accent` | Card `iconWrap` |
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

## 4. Full JSON Schema Reference

### Top-Level Scenario Fields

| Field | Type | Required | Controls |
|---|---|---|---|
| `id` | `string` | Yes | Internal identifier, not displayed |
| `title` | `string` | Yes | Page title and scenario heading |
| `description` | `string` | Yes | Subtitle below the title |
| `rfc` | `string` | No | RFC badge next to title |
| `category` | `string` | Yes | Grouping label in navigation |
| `participants` | `Participant[]` | Yes | Swim lane columns, left to right |
| `steps` | `ProtocolStep[]` | Yes | All protocol steps |

### Participant Fields

| Field | Type | Required | Controls |
|---|---|---|---|
| `id` | `string` | Yes | Referenced by step `from`/`to` |
| `label` | `string` | Yes | Displayed in swim lane header |
| `type` | `ParticipantType` | Yes | Swim lane background color |
| `port` | `number` | No | Displayed below label in swim lane |

**Participant type → swim lane color:**

| `type` | Color |
|---|---|
| `"client"` | Orange |
| `"server"` | Green |
| `"idp"` | Purple |
| `"kms"` | Red |
| `"proxy"` | Sky blue |
| `"user"` | Amber |

### ProtocolStep Fields

| Field | Type | Required | Controls |
|---|---|---|---|
| `step` | `number` | Yes | Step number (1-based, sequential) |
| `from` | `string` | Yes | Originating participant ID |
| `to` | `string` | Yes | Target participant ID |
| `label` | `string` | Yes | Arrow label in sequence diagram |
| `method` | `string` | Yes | HTTP method badge in inspector |
| `url` | `string` | Yes | Request URL in inspector |
| `request_headers` | `Record<string, string>` | Yes | Request headers tab |
| `request_body` | `unknown` | No | Request body tab (null = empty) |
| `response_status` | `number` | Yes | Arrow color + status badge |
| `response_headers` | `Record<string, string>` | Yes | Response headers tab |
| `response_body` | `unknown` | No | Response body tab (null = empty) |
| `artifacts` | `CryptoArtifact[]` | Yes | Crypto artifact drawer (`[]` if none) |
| `tokens` | `unknown[]` | Yes | Token display (`[]` if none) |
| `explanation` | `string` | Yes | Narrative panel below step header |
| `annotations` | `string[]` | Yes | Bullet points in narrative panel (`[]` if none) |
| `is_response` | `boolean` | No | Renders as dashed return arrow |

### CryptoArtifact Fields

| Field | Type | Required | Controls |
|---|---|---|---|
| `type` | `CryptoArtifactType` | Yes | Badge color in artifact drawer |
| `raw_input` | `string` | Yes | Full input to signing function |
| `signing_key_hint` | `string` | Yes | Key description (not the actual secret) |
| `final_output` | `string` | Yes | Resulting signature/hash |
| `steps` | `CryptoArtifactStep[]` | No | Step-by-step breakdown accordion |

**CryptoArtifact type → badge color:**

| `type` | Badge color |
|---|---|
| `"hmac-sha1"` | Yellow |
| `"hmac-sha256"` | Orange |
| `"rsa-sha256"` | Blue |
| `"jwt"` | Indigo |
| `"custom"` | Gray |

### CryptoArtifactStep Fields

| Field | Type | Required | Controls |
|---|---|---|---|
| `label` | `string` | Yes | Accordion item title |
| `value` | `string` | Yes | Monospace preformatted content |

Use `\n` in `value` for line breaks within a step. The content is rendered in a `<pre>` block.

### HTTP Status Code → Arrow Color

| Range | Arrow color |
|---|---|
| 2xx | Green |
| 3xx | Blue |
| 4xx | Red |
| 5xx | Red |

---

## 5. Complete Worked Example

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
    { "id": "user",   "label": "User / Browser", "type": "user" },
    { "id": "authz",  "label": "Auth Server", "type": "idp" }
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
      "response_headers": {
        "Content-Type": "application/json"
      },
      "response_body": { "code": "AUTH_CODE_XYZ", "expires_in": 600 },
      "artifacts": [
        {
          "type": "hmac-sha256",
          "raw_input": "POST\nauth.example.com\n/fooauth/authorize\nclient_id=abc&redirect_uri=...",
          "signing_key_hint": "client_secret (registered with auth server)",
          "final_output": "Base64HMACOutputHere==",
          "steps": [
            {
              "label": "1. Build String to Sign",
              "value": "POST\nauth.example.com\n/fooauth/authorize\nclient_id=abc&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb"
            },
            {
              "label": "2. Compute HMAC-SHA256",
              "value": "HMAC-SHA256(client_secret, string_to_sign) → raw bytes → Base64\n→ Base64HMACOutputHere=="
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
      "response_headers": {
        "Location": "https://auth.example.com/grant?code=AUTH_CODE_XYZ"
      },
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
      "response_headers": {
        "Content-Type": "application/json"
      },
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

## 6. Color & Theming Reference

### Available Tailwind Color Families

Any Tailwind v3 color family can be used. These work well for protocol themes:

`orange` · `blue` · `green` · `purple` · `sky` · `indigo` · `teal` · `rose` · `amber` · `cyan` · `violet` · `emerald`

### Current Color Assignments

| Protocol | Color family |
|---|---|
| OAuth 1.0a | Orange |

Choose a family not already in this table to avoid visual ambiguity in the sidebar and homepage.

### Consistency Rule

Use **one color family per protocol** across all three registration points:

```
Sidebar color:   text-[color]-400
Card accent:     border-[color]-500/35 hover:border-[color]-500/55
Card icon wrap:  bg-[color]-500/15 text-[color]-400
```

---

## 7. Verification Checklist

After adding a protocol, verify each item:

- [ ] Spec document saved to `protocols/[proto]/rfc####.txt` (or equivalent)
- [ ] JSON is valid (no syntax errors) — paste into a JSON validator or run `npm run build`
- [ ] All `from`/`to` IDs in `steps` match IDs in the `participants` array
- [ ] All `step` numbers are sequential starting from 1
- [ ] All steps have `"artifacts": []` or a valid artifacts array (never omitted)
- [ ] All steps have `"tokens": []` or a valid tokens array (never omitted)
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

## 8. Troubleshooting Common Mistakes

### `from`/`to` IDs don't match participant IDs → arrows break

The sequence diagram silently fails to render arrows when participant IDs don't match. Double-check that every `from` and `to` value in every step exactly matches one of the `id` fields in the `participants` array (case-sensitive).

```json
// ❌ Typo in step — participant ID is "authz-server" but step says "authz_server"
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

These fields are required on every step. Omitting them (not just making them null) causes a runtime crash because the UI iterates over them unconditionally.

```json
// ❌ Missing — will crash
{ "step": 2, "from": "a", "to": "b", "label": "...", ... }

// ✅ Correct — empty arrays
{ "step": 2, "from": "a", "to": "b", "label": "...", "artifacts": [], "tokens": [], ... }
```

### Missing `annotations: []` → potential render issue

The UI guards against a missing `annotations` field, but include it explicitly as `[]` to be safe and consistent.

### `request_body: null` vs omitting the field

Both are acceptable — `null` renders as an empty body tab. However, explicitly setting `"request_body": null` is preferred over omitting the field entirely, as it makes intent clear and avoids ambiguity if the schema evolves.

### Wrong `CryptoArtifact` type → wrong badge color, not a crash

Using `"type": "custom"` on an HMAC-SHA256 step won't crash, but the badge will appear gray instead of orange. Match the type to the actual algorithm used.

### Route mismatch between page.tsx path and sidebar/homepage href

If `app/fooauth/happy-path/page.tsx` exists but the sidebar uses `href: "/fooauth/happypath"` (missing hyphen), the nav link will 404. Ensure the directory name, sidebar href, and homepage href are identical:

```
app/fooauth/happy-path/page.tsx          ← directory path
href: "/fooauth/happy-path"              ← sidebar and homepage (must match)
```

### TypeScript build error on JSON import

If `npm run build` complains about the JSON import type not matching `Scenario`, ensure the cast is exactly:

```typescript
scenarioData as unknown as Scenario
```

Not `scenarioData as Scenario` (direct cast fails) and not omitting the cast entirely.

### Scenario not appearing in sidebar

The sidebar reads from the static `NAV` array at module load time. After editing `Sidebar.tsx`, the dev server hot-reloads automatically, but verify the entry was added to the correct `NAV` array (it's at the top of the file, not inside a component).
