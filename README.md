# OnceUpon

A token launchpad on Circle Arc. Authors launch original Stories. Fees either push to the Author on every swap, or stream into an ownerless vault that holders claim as The Piece.

Launch on Arc. Trade in USDC. Fees that actually move.

This is Phase 0 of the pad: glass launchpad UI, X identity on a dedicated Supabase project, Arc testnet config, Foundry fee-cap helpers, and Arc-themed trade widgets. Factory, vault, and bonding curve come next.

## What this repo is not

OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else. Childhood language is aesthetic. The Piece is a protocol fee split among current holders.

## Isolated backend

Identity and Postgres live on a dedicated Supabase project named **OnceUpon** (`txrdfjypnuvlyseefclj`).

The existing OrbitX/Soltools project is untouched. X OAuth credentials were copied onto the new project only. On the **existing** X developer app (do not rotate the OrbitX callback), add this second callback:

```
https://txrdfjypnuvlyseefclj.supabase.co/auth/v1/callback
```

Also required on that X app:

- Type of App: Web App
- Website URL: `https://once-upon-arc.vercel.app/`
- Request email from users: on (Supabase always sends `users.email`)
- If the X project is in Development, your X account must be a listed tester

That X error — “You weren't able to give access to the App” — is X rejecting the callback or email permission before OnceUpon runs.

Dashboard: https://supabase.com/dashboard/project/txrdfjypnuvlyseefclj

## Run locally

```bash
pnpm install
cp .env.example .env.local   # then fill keys from the OnceUpon project
pnpm dev
```

The app binds to `http://127.0.0.1:43147`.

Required env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (avatar copier only)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (from https://thirdweb.com/create-api-key — allow `localhost:43147` and `once-upon-arc.vercel.app`)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- thirdweb v5 crypto UI themed ink/gold against Arc testnet `5042002`
- Foundry under `contracts/`

## Surfaces

| Path | Job |
| --- | --- |
| `/` | Home feed — new, trending, on the curve, recently bonded |
| `/launch` | Launch types + compose (Author, OnceUponers, gated RWA) |
| `/write` | Redirects to `/launch` |
| `/wallet` | Trade — connect, buy, swap, bridge on Arc |
| `/story/[slug]` | A live launch |
| `/shelf/[handle]` | Profile |
| `/ledger` | The Piece claims |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

## Launch types

- **Author** — Keep the pen. Fees land in the author’s wallet on every trade (0–3.00%).
- **OnceUponers** — Share the book. Fees land in an ownerless vault. Holders claim The Piece (author cap 1.00%).
- **Tokenized RWA / single-name** — Gated until a licensed issuer lists that name on Arc.
- Quotes: **USDC** and **EURC** are listed. Bonding graduates at **5,000 USDC**.

## Network

Arc Testnet — chain ID `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`. Native gas USDC is 18 decimals. Pool USDC is the ERC-20 at `0x3600…0000` with 6 decimals. Do not mix them.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
