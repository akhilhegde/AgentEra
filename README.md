# AgentHub — AI Skill Marketplace

> **"Don't pay for an AI. Pay only for the skill you use."**

AgentHub is a pay-per-use AI skill marketplace built on the **x402 protocol** with real payment settlement on **Algorand Testnet**. Every skill execution triggers a verified on-chain USDC micro-payment.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Frontend (React + Vite + Tailwind)                  │
│  Landing │ Marketplace │ Execute │ Dashboard │ Demo  │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP (Vite proxy)
┌─────────────────────▼────────────────────────────────┐
│  Backend (Hono + Node.js + TypeScript)               │
│                                                      │
│  /api/skills     ← Skill Registry (public)           │
│  /api/execute    ← Payment Proxy (public → x402)     │
│  /api/agent/*    ← Multi-Skill Orchestrator          │
│  /api/skills/*   ← x402-Protected Skill Endpoints    │
│                                                      │
│  ┌────────────────┐  ┌───────────────────────┐       │
│  │ x402 Middleware │  │ AI Service (Gemini/   │       │
│  │ (payment gate) │  │ OpenAI abstraction)   │       │
│  └───────┬────────┘  └───────────────────────┘       │
└──────────┼───────────────────────────────────────────┘
           │ /verify + /settle
┌──────────▼───────────────────────────────────────────┐
│  GoPlausible Facilitator                             │
│  https://facilitator.goplausible.xyz                 │
└──────────┬───────────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────────┐
│  Algorand Testnet — USDC ASA #10458941               │
└──────────────────────────────────────────────────────┘
```

## x402 Payment Flow

```
1. User clicks "Pay $0.01 & Execute" in the UI
2. Frontend calls POST /api/execute (payment proxy)
3. Proxy calls POST /api/skills/resume-review (x402-protected)
4. Middleware returns HTTP 402 with PAYMENT-REQUIRED header
5. x402 client (server-side) signs USDC payment on Algorand
6. x402 client retries request with PAYMENT-SIGNATURE header
7. Middleware sends to Facilitator → /verify
8. Facilitator verifies → Middleware sends → /settle
9. Facilitator settles on Algorand → returns Transaction ID
10. Skill endpoint executes AI → returns result
11. Response includes PAYMENT-RESPONSE header with real TX ID
12. Frontend displays result + transaction proof + explorer link
```

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React, TypeScript, Vite, Tailwind CSS |
| Backend     | Hono, Node.js, TypeScript |
| Blockchain  | Algorand Testnet, USDC ASA #10458941 |
| Protocol    | x402 (HTTP 402 Payment Required) |
| AI          | Gemini / OpenAI (configurable) |
| Facilitator | GoPlausible hosted facilitator |
| Packages    | @x402-avm/hono, @x402-avm/core, @x402/fetch, @x402/avm |

## Project Structure

```
agenthub/
├── apps/
│   ├── web/          # React frontend
│   │   └── src/
│   │       ├── components/  # Navbar, SkillCard, TransactionReceipt
│   │       ├── pages/       # Landing, Marketplace, Skill, Dashboard, Demo, Developers
│   │       ├── services/    # API client
│   │       └── stores/      # Zustand payment history
│   └── api/          # Hono backend
│       └── src/
│           ├── config/      # x402.config.ts, ai.config.ts
│           ├── middleware/   # x402 payment middleware
│           ├── routes/       # Skills, API, Agent routes
│           └── services/     # AI, Skill Registry, Payment Client, Orchestrator
├── packages/
│   └── shared/       # Shared TypeScript types & constants
├── docs/
├── .env.example
└── README.md
```

## Local Setup

### Prerequisites
- Node.js 18+
- Two Algorand Testnet wallets (Payer + Receiver)
- Testnet ALGO and USDC
- AI API key (Gemini or OpenAI)

### 1. Clone & Install

```bash
git clone <repo-url>
cd agenthub
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Algorand Testnet Setup

1. **Create wallets**: Use [Pera Wallet](https://perawallet.app/) or AlgoKit CLI
2. **Fund with ALGO**: [Lora Faucet](https://lora.algokit.io/testnet/fund)
3. **Opt-in to USDC**: Both wallets must opt-in to ASA ID `10458941`
4. **Fund with USDC**: [Circle Faucet](https://faucet.circle.com/) → Select Algorand Testnet
5. **Set PAYER_MNEMONIC** in `.env` (25-word mnemonic, server-side only)
6. **Set RECEIVER_ADDRESS** in `.env`

### 4. Run

```bash
# Terminal 1: API server
cd apps/api && npx tsx src/index.ts

# Terminal 2: Frontend
cd apps/web && npx vite
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### 5. Test Payment Flow

```bash
# 1. Verify 402 without payment
curl -X POST http://localhost:3001/api/skills/resume-review \
  -H "Content-Type: application/json" \
  -d '{"input": "test"}'
# Expected: HTTP 402 with PAYMENT-REQUIRED header

# 2. Execute via payment proxy
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{"skillId": "resume-reviewer", "input": "Your resume text"}'
# Expected: 200 with AI result + transactionId
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AI_PROVIDER` | `gemini` or `openai` | Yes |
| `AI_API_KEY` | API key for your AI provider | Yes |
| `PAYER_MNEMONIC` | 25-word Algorand mnemonic (payer) | Yes |
| `RECEIVER_ADDRESS` | Algorand address (receiver) | Yes |
| `USDC_ASA_ID` | USDC asset ID (`10458941` for testnet) | No (default) |
| `FACILITATOR_URL` | x402 facilitator URL | No (default) |
| `API_PORT` | Backend port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: localhost:5173) |

## Skills

| Skill | Price | Category |
|-------|-------|----------|
| Resume Reviewer | $0.01 USDC | Career |
| Code Reviewer | $0.02 USDC | Coding |
| Text Summarizer | $0.01 USDC | Writing |
| Startup Idea Analyzer | $0.03 USDC | Business |

## Agent Mode

Enter a complex request like "Prepare me for a Google software engineering interview" and AgentHub will:

1. Create an execution plan (matching relevant skills)
2. Show cost breakdown per skill
3. Execute each skill with x402 payment
4. Return combined results with all transaction IDs

## Security

- Private keys are **NEVER** exposed to the frontend
- Payment signing happens server-side via a proxy endpoint
- The server determines skill prices — clients cannot override
- `.env` is in `.gitignore`
- Input validation on all endpoints

## Hackathon Compliance

- [x] Working x402 endpoint (HTTP 402 → payment → settlement)
- [x] Algorand Testnet with USDC
- [x] Pay-per-use model (no subscriptions)
- [x] Client signs payment via x402 client
- [x] Facilitator verifies and settles
- [x] Real Algorand Transaction ID in response
- [x] Transaction proof UI with Explorer link
- [x] Agent mode (multi-skill orchestration)
- [x] Clean documentation

## License

MIT — Built for the Algorand x402 Hackathon
