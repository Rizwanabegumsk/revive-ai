# REVIVE AI — AI-Powered Revenue Recovery Platform

> **Buildthon Demo Edition** · Automated payment failure recovery engine, deterministic policy safety layer, and real-time revenue analytics.

---

## 1. Overview

**REVIVE AI** is an intelligent payment revenue recovery platform designed to identify failed digital payment attempts, predict retry recovery probability, and execute optimal recovery strategies under deterministic merchant safety policies.

Instead of blind, aggressive retries that increase gateway authorization fees and trigger bank security blocks, REVIVE AI acts as a smart orchestration layer between payment failures and recovery execution.

---

## 2. The Problem

Over **$110 Billion** in digital commerce transactions fail globally each year due to soft gateway errors, transient bank timeouts, authentication friction, and expired payment details. 

- **Merchant Revenue Leakage**: Up to 15-20% of legitimate customers abandon purchases after a single payment failure.
- **Naïve Retries Cause Card Blocks**: Retrying failed transactions blindly leads to issuer flags, account lockouts, and expensive chargeback fees.
- **Lack of Policy Governance**: Uncontrolled retry bots risk executing transactions outside merchant limits or retry caps.

---

## 3. The Solution

REVIVE AI introduces a dual-engine architecture for revenue recovery:

1. **Recovery Intelligence Engine (AI Recommends)**: Evaluates customer payment history, channel success rates, failure code characteristics, and retry counts to calculate a recovery probability score and optimal strategy.
2. **Policy & Safety Engine (Policy Authorizes)**: An independent, deterministic safety layer that validates AI recommendations against merchant policies before authorizing execution.
3. **Execution Simulator (Simulation Mode)**: Safely simulates gateway retries without moving real money or touching sensitive credit card credentials.
4. **Analytics & Optimization Center**: Tracks revenue at risk, recovered yield, method success rates, and A/B strategy performance.

---

## 4. Track & Category

- **Category**: FinTech & Payment Infrastructure / AI Systems
- **Target Use Case**: E-commerce Merchants, SaaS Subscription Platforms, Payment Service Providers (PSPs)

---

## 5. System Architecture

```text
               FAILED PAYMENT
                     ↓
             React / Vite UI
                     ↓
            Express REST API
                     ↓
              MongoDB Database
                     ↓
       Revive Recovery Engine v1
         (AI Recommends Strategy)
                     ↓
          Policy & Safety Engine
        (Deterministic Authorization)
                     ↓
        APPROVED / BLOCKED / MANUAL
                     ↓
       Recovery Execution Simulator
       (Controlled Simulation Mode)
                     ↓
          MongoDB RecoveryOutcome
                     ↓
      Analytics & Strategy Experiments
```

### Core Architecture Principles
- **AI Recommends**: The Recovery Intelligence Engine calculates scores and recommends strategies.
- **Policy Authorizes**: The Policy Engine independently validates merchant rules server-side before execution.
- **Execution Simulates**: Recovery attempts run in controlled simulation mode for safety.
- **Outcome Records**: Every outcome is persisted to MongoDB with audit timeline event logs.
- **Analytics Measures**: Real-time DB aggregations compute revenue at risk and recovered yield.
- **Experiments Optimize**: A/B testing framework compares strategy variants with statistical confidence gates.

---

## 6. AI Recovery Engine (`v1`)

> **Honest Model Description**: *Revive Recovery Engine v1 is an explainable weighted recovery-intelligence model. It combines customer transaction history, payment method affinity, gateway failure code characteristics, retry counts, and historical recovery outcomes to calculate recovery probability scores.*

### Key Engine Signals
- **Customer Success Ratio**: Historical ratio of successful payments for the customer profile.
- **Failure Code Recoverability**: Transient errors (e.g., `temporary bank server timeout`) receive higher recovery scores than hard declines (`account closed`).
- **Payment Method Affinity**: Prefers payment methods (e.g. `UPI` or `CARD`) with strong historical success for the target merchant.
- **Retry Fatigue Penalty**: Exponential penalty for repeated failed attempts to prevent bank blacklisting.

---

## 7. Policy & Safety Engine

The Policy Engine enforces 8 deterministic merchant safety rules:

1. **Auto-Recovery Master Switch**: Verifies automatic recovery is enabled for the merchant store.
2. **Amount Cap**: Ensures transaction amount is within the auto-recovery limit (e.g., ₹10,000).
3. **Max Retry Count**: Blocks execution if retry count >= maximum allowed attempts (2 retries).
4. **Permitted Payment Methods**: Restricts execution to authorized methods (`UPI`, `CARD`).
5. **Failure Reason Eligibility**: Restricts auto-retry to soft recoverable failures.
6. **Probability Threshold**: Requires recovery probability >= 50% for automatic approval.
7. **Auth / Fraud Escrow**: Forces `MANUAL_REVIEW` for authentication or fraud flags.
8. **Permanent Decline Block**: Instantly blocks hard declines (`card stolen`, `do not honor`).

---

## 8. Key Features

- **Hero Transaction Flow (`RV-28491`)**: Interactive end-to-end demo transaction with ₹4,999 recovered yield.
- **Confirmation Dialog**: Action confirmation modal preventing accidental executions.
- **Interactive Step Timeline**: Visual execution progress (`Initiated ➔ Authorized ➔ Simulated ➔ Response Received`).
- **Recovery Analytics Command Center**: Real-time revenue at risk, recovered yield, failure intelligence, and top opportunities.
- **Strategy Optimization Experiments**: A/B testing framework with statistical safety gates (`MINIMUM_SAMPLE_SIZE = 20`).
- **Duplicate Execution Protection**: Server-side idempotency guard returning `HTTP 409 Conflict` on duplicate execution attempts.

---

## 9. Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript 5, Vanilla CSS Design System, Lucide Icons, Recharts.
- **Backend**: Node.js, Express 4, TypeScript 5.
- **Data Layer**: MongoDB, Mongoose 8 (with zero-dependency `mongodb-memory-server` dev fallback).
- **Environment & Routing**: Centralized API config (`VITE_API_URL`), CORS authorization (`CLIENT_URL`), React Router 7.

---

## 10. Environment Variables

### Frontend (`.env` or `.env.example`)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (`server/.env` or `server/.env.example`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/revive_ai
CLIENT_URL=http://localhost:5173
```

---

## 11. Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone Repository & Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Seed Database
```bash
cd server
npm run seed
cd ..
```

### 3. Start Development Servers
```bash
# Terminal 1 — Start Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 — Start Frontend Server (Port 5173)
cd ..
npm run dev
```

---

## 12. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/payments` | List all payments |
| `GET` | `/api/payments/:paymentId` | Get payment details, AI decision & policy status |
| `POST` | `/api/recovery/evaluate` | Run policy evaluation for a payment |
| `POST` | `/api/recovery/execute` | Execute simulated recovery (Body: `{ "paymentId": "RV-28491" }`) |
| `GET` | `/api/recovery/events/:paymentId` | Get decision timeline audit events |
| `GET` | `/api/analytics/overview` | Core revenue recovery analytics |
| `GET` | `/api/analytics/trends` | Time-series recovery trend data |
| `GET` | `/api/analytics/methods` | Method performance metrics |
| `GET` | `/api/analytics/failures` | Failure reason intelligence |
| `GET` | `/api/analytics/gateways` | Gateway performance breakdown |
| `GET` | `/api/analytics/top-recoverable` | Top high-probability recoverable payments |
| `GET` | `/api/experiments` | List strategy optimization experiments |
| `GET` | `/api/experiments/:expId` | Get detailed experiment comparison |
| `POST` | `/api/experiments` | Create new recovery experiment |
| `POST` | `/api/experiments/:expId/pause` | Pause experiment |
| `POST` | `/api/experiments/:expId/activate` | Activate experiment |

---

## 13. Primary Demo Walkthrough (`RV-28491`)

1. **Open Frontend**: Navigate to [http://localhost:5173](http://localhost:5173).
2. **Select Hero Transaction**: Click **RV-28491** (Aisha Khan · ₹4,999 · Failed).
3. **Review AI Assessment**: Note 82% recovery probability and `HIGH CONFIDENCE` rating.
4. **Inspect Reasoning**: Expand *"Why this decision?"* to review engine scoring signals.
5. **Review Policy Check**: Confirm Policy Engine status shows `APPROVED FOR RECOVERY`.
6. **Execute Recovery**: Click **Execute Recovery**, review the confirmation modal, and confirm.
7. **Observe Simulation**: Watch the step timeline progress and complete with **✓ Recovery Successful (₹4,999 recovered via UPI)**.
8. **Verify Outcome**: Confirm status updates to `RECOVERED` and duplicate execution button is disabled.
9. **Review Analytics**: Navigate to Overview and click **Refresh Analytics** to see +₹4,999 reflected in recovered revenue.
10. **Review Experiments**: Navigate to **Experiments** to view A/B strategy variant performance and statistical confidence gates.

---

## 14. Safety & Simulation Disclaimer

> ⚠️ **IMPORTANT**: REVIVE AI runs in **Controlled Simulation Mode** for Buildthon demonstration. No real financial transactions take place, no real payment credentials are used, and no live Razorpay APIs are invoked. All payment executions are simulated backend events cleanly labeled `"SIMULATION MODE"`.

---

## 15. Deployment Documentation

### Production Deployment Strategy
- **Frontend**: Deploy static build (`npm run build` ➔ `dist/`) to Vercel, Netlify, or Cloudflare Pages. Configure environment variable `VITE_API_URL` to point to production backend API.
- **Backend**: Deploy Node/Express service (`npm run build` ➔ `npm start`) to Render, Railway, AWS ECS, or DigitalOcean App Platform. Configure `MONGODB_URI`, `PORT`, `CLIENT_URL`, and `NODE_ENV=production`.
- **Database**: Production MongoDB cluster hosted on MongoDB Atlas.

---

## 16. Future Roadmap

- **Dynamic ML Weight Tuning**: Auto-adjust Recovery Engine weights based on experiment outcomes.
- **Real Payment Gateway Adapters**: Webhook integration for Razorpay, Stripe, and PhonePe.
- **Customer Recovery Messaging**: Multi-channel SMS/WhatsApp payment link dispatch for human-in-the-loop recovery.
