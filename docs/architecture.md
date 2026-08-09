# AgentHub Architecture

## System Overview

AgentHub is a pay-per-use AI skill marketplace. The system has three main layers:

1. **Frontend** — React SPA for skill discovery and execution
2. **Backend** — Hono API server with x402 payment gating
3. **Blockchain** — Algorand Testnet for USDC payment settlement

## Payment Architecture

### Why Server-Side Payment Proxy?

The x402 payment client needs access to the payer's private key to sign transactions. For security, we run the payment client on the **backend**:

```
Frontend                    Backend                           External
────────                    ───────                           ────────
POST /api/execute ──────►  Payment Proxy
                           │
                           ├── POST /api/skills/resume-review
                           │   ← 402 PAYMENT-REQUIRED
                           │
                           ├── Signs USDC payment (server-side)
                           │
                           ├── Retries with PAYMENT-SIGNATURE
                           │   ──────► Facilitator /verify ──►  Algorand
                           │   ◄────── Verification OK     ◄──  Testnet
                           │   ──────► Facilitator /settle ──►
                           │   ◄────── Settlement + TX ID  ◄──
                           │
                           ├── Skill executes AI
                           │
                           ◄── 200 OK + result + TX ID
────────────────────────── ◄──
```

### x402 Headers

| Header | Direction | Content |
|--------|-----------|---------|
| `PAYMENT-REQUIRED` | Server → Client | Base64 JSON with payment requirements |
| `PAYMENT-SIGNATURE` | Client → Server | Base64 payment proof |
| `PAYMENT-RESPONSE` | Server → Client | Base64 JSON with settlement TX ID |

### Settlement Response Format

```json
{
  "success": true,
  "transaction": "ALGORAND_TX_ID_HERE",
  "network": "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
  "payer": "PAYER_ADDRESS",
  "errorReason": null
}
```

## Agent Mode Architecture

```
User Query: "Prepare me for a Google interview"
           │
           ▼
   ┌───────────────────┐
   │  Agent Planner    │
   │  (keyword match   │
   │   + AI fallback)  │
   └───────┬───────────┘
           │
           ▼
   ┌───────────────────┐
   │  Execution Plan   │
   │  1. Resume Review │  $0.01
   │  2. Code Review   │  $0.02
   │  3. Summarizer    │  $0.01
   │  Total: $0.04     │
   └───────┬───────────┘
           │
           ▼
   ┌───────────────────┐
   │  Sequential       │
   │  Execution        │
   │  (each skill via  │
   │   x402 payment)   │
   └───────┬───────────┘
           │
           ▼
   Combined results + all TX IDs
```

## Key Packages

| Package | Role |
|---------|------|
| `@x402-avm/hono` | `paymentMiddlewareFromConfig` — Hono middleware |
| `@x402-avm/core/server` | `HTTPFacilitatorClient` — Talks to facilitator |
| `@x402-avm/avm` | `ALGORAND_TESTNET_CAIP2` — Network constant |
| `@x402/fetch` | `wrapFetchWithPayment` — Auto-handles 402 |
| `@x402/avm` | `toClientAvmSigner`, `ExactAvmScheme` — Signing |
