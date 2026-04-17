# Token Protocol Explorer

An interactive visualizer for network authentication protocols. Step through protocol flows frame-by-frame and inspect cryptographic details at every hop.

## Overview

Token Protocol Explorer transforms complex authentication protocols into interactive, step-by-step animations. Instead of reading dense RFC specifications, you watch the data flow between actors and can inspect the cryptographic math at every single step.

**Supported Protocols:**
- OAuth 1.0a
- AWS SigV4 (planned)
- SAML (planned)
- OIDC (planned)
- Kerberos (planned)

## Tech Stack

- **Framework:** Next.js 16.2.3 with App Router
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Note:** If you encounter webpack issues, use the default webpack option:
```bash
npm run dev          # Uses webpack
npm run dev:turbo    # Uses Turbo
```

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── oauth1a/             # OAuth 1.0a protocol routes
│       └── happy-path/      # Scenario page
├── components/
│   ├── layout/              # Layout components
│   │   └── AppShell.tsx     # Main app shell
│   └── core/                # Core visualization components
│       ├── SequenceDiagram.tsx    # Protocol flow diagram
│       ├── StepController.tsx      # Playback controls
│       ├── HeaderInspector.tsx     # Request/response inspector
│       └── CryptoArtifactVisualizer.tsx # Cryptography details
├── lib/
│   ├── store.ts            # Zustand state store
│   └── utils.ts            # Utility functions
├── protocols/              # Protocol scenario definitions
│   └── oauth1a/
│       └── scenarios/
│           └── happy-path.json
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## How It Works

### The Architecture

The app uses a **"dumb UI, smart data"** approach:

1. **Scenario Files (JSON):** Define the protocol flow with participants, steps, network requests, and cryptographic details
2. **UI Components:** Render the scenario data as animated sequence diagrams and interactive inspectors
3. **State Store:** Tracks playback state (current step, play/pause, speed)

### Key Components

**StepController** - Playback controls (play, pause, next, previous, timeline scrubber)

**SequenceDiagram** - Animated diagram showing data flow between actors (client, server, IDP, etc.)

**HeaderInspector** - Deep-dive view of HTTP headers, request/response bodies, and decoded tokens

**CryptoArtifactVisualizer** - Step-by-step visualization of cryptographic signatures and their inputs

## Adding New Protocols

See `NEW-PROTO.md` for complete architecture guidelines on adding new protocols.

Quick steps:
1. Create a new scenario JSON file in `protocols/[protocol]/scenarios/`
2. Add a corresponding Next.js route in `app/[protocol]/[scenario]/`
3. The components will render the scenario automatically

## Linting

```bash
npm run lint
```

## License

Private
