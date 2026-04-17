# Protocol Explorer Engine: Blueprint & Implementation Guide

This document outlines the architecture, theme, and implementation guidelines for building an interactive, data-driven "Protocol Explorer." This blueprint abstracts the design patterns of the `AAuth Explorer` so they can be universally applied to any complex network protocol (e.g., OAuth 1.0a, AWS SigV4, SAML, OIDC, Kerberos).

---

## 1. The Core Idea
**"X-Ray Vision for Network Protocols"**

Reading RFCs and protocol specifications is notoriously dry and difficult. The Protocol Explorer Engine transforms static text into an interactive, step-by-step playback engine. Instead of reading about how a signature is generated or how a token is passed, the user *watches the bytes flow* and can inspect the cryptographic math at every single step.

**The Golden Rule:** The UI must be completely dumb. All protocol logic, network payloads, and cryptographic proofs must be defined in static JSON "Scenario" files. The UI is simply a media player for these JSON files.

## 2. Theme & UX Design
The visual language should feel highly technical, trustworthy, and forensic. 

*   **Aesthetic:** "Modern Forensics" / Dark Mode Native. Think sleek developer tools, terminal interfaces, and network analyzers (like a modern Wireshark).
*   **Typography:** Use a clean sans-serif (e.g., Inter, Geist) for UI, and heavily utilize Monospace (JetBrains Mono, Fira Code) for payloads, headers, and cryptographic strings.
*   **Color Coding:** 
    *   Color-code specific *types* of data, not just UI elements. 
    *   *Example:* Keys/Secrets are always Purple, Signatures are Orange, Identifiers are Blue, Payloads are Green. This creates visual continuity when a key transforms into a signature.
*   **Layout Structure (3-Pane):**
    1.  **Left Sidebar:** Scenario selection and narrative text (explaining *why* this step happens).
    2.  **Center Stage:** The animated Sequence/Topology diagram. Arrows physically move from Actor A to Actor B as the playhead advances.
    3.  **Right Panel (The Inspector):** Context-aware deep dive. Clicking an arrow or a token here reveals raw Headers, decoded JWTs, or the mathematical breakdown of a signature.

## 3. The Generic Data Model (The Engine)
To support *any* protocol, the TypeScript/JSON schema must be heavily abstracted. 

```typescript
// 1. Actors in the system
export interface Participant {
  id: string;
  label: string;
  type: "client" | "server" | "idp" | "kms" | "proxy";
}

// 2. Cryptographic Proofs (The most important part for SigV4/OAuth 1.0a)
export interface CryptoArtifact {
  type: "hmac-sha256" | "rsa-sha256" | "jwt" | "custom";
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
  label: string; // Short text for the arrow
  
  // Network Layer
  http: {
    method: string;
    url: string;
    request_headers: Record<string, string>;
    request_body?: any;
    response_status: number;
    response_headers: Record<string, string>;
  };

  // Contextual Payloads & Math
  artifacts: CryptoArtifact[];
  tokens: any[]; 
  
  // Narrative
  explanation: string; // Text explaining this exact moment
}

export interface Scenario {
  id: string;
  title: string;
  participants: Participant[];
  steps: ProtocolStep[];
}
```

## 4. Implementation Guidelines (Tech Stack)

### Stack Recommendations
*   **Framework:** Next.js (App Router) or React + Vite.
*   **State Management:** `zustand` is mandatory. You need a global store to track `currentStep`, `isPlaying`, `playbackSpeed`, and `selectedArtifactIndex`.
*   **Animation:** `framer-motion` for sequence arrows. Arrows shouldn't just appear; they should animate from origin to destination to imply network travel.
*   **Styling:** Tailwind CSS + `shadcn/ui` for rapid, consistent component design.

### Core Components to Build
1.  **`ScenarioPlayer` / `StepController`**: A floating bar with Play, Pause, Next, Prev, and a scrubber timeline.
2.  **`SequenceDiagram`**: Reads the `participants` and draws them as columns. Reads `currentStep` and draws an arrow from `step.from` to `step.to`. 
3.  **`InspectorPanel`**: A dynamic sidebar. If the current step contains `artifacts`, render a specialized component (e.g., `SigV4Visualizer` or `OAuth1SignatureVisualizer`) that highlights exactly how the string was concatenated and hashed.

## 5. The "Copy/Paste" Prompt for AI Generation
When you are ready to build a new protocol explorer, hand an AI this exact prompt along with this document:

> "I want to build an interactive Protocol Explorer Engine for **[INSERT PROTOCOL HERE, e.g., AWS SigV4]**. 
> 
> Please read the architecture guidelines in the provided `NEW-PROTO.md` file. 
> 
> Your first task is to design the JSON data schema (`types.ts`) required to represent this specific protocol's network requests and cryptographic signatures, heavily inspired by the generic model in the doc. 
>
> Your second task is to write a complete mock `scenario.json` file for a standard, happy-path flow of this protocol. Ensure the JSON deeply details the exact cryptographic inputs (like Canonical Requests, String-to-Sign, and final HMAC signatures) so we can visualize the math step-by-step.
> 
> Finally, scaffold the Next.js/Zustand application that plays this JSON back frame-by-frame."
