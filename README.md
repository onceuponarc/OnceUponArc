# OnceUpon

A token launchpad on Circle Arc. Authors write Stories. Fees either push to the Author on every swap, or stream into an ownerless vault that holders claim as The Piece.

OnceUponers write the stories. The chain keeps the receipts.

This is Phase 0: the Desk shell, X identity on a **new** Supabase project, Arc testnet config, Foundry fee-cap helpers, and the thirdweb playground crypto widgets themed for OnceUpon. Factory, vault, and bonding curve come next.

## What this repo is not

OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else. Childhood language is aesthetic. The Piece is a protocol fee split among current holders.

## Isolated backend

Identity and Postgres live on a dedicated Supabase project named **OnceUpon** (`txrdfjypnuvlyseefclj`).

The existing OrbitX/Soltools project is untouched. X OAuth credentials were copied onto the new project only. Add this callback on the existing X developer app (do not rotate the OrbitX callback):

```
https://txrdfjypnuvlyseefclj.supabase.co/auth/v1/callback
```

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
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (from https://thirdweb.com/create-api-key — allow `localhost:43147`)

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- thirdweb v5 crypto UI (Connect, Buy, Swap, Bridge, Checkout, Transaction, Token/Account/Chain/NFT) themed ink/gold against Arc testnet `5042002`
- Foundry under `contracts/`

## Surfaces

| Path | Job |
| --- | --- |
| `/` | The Desk |
| `/write` | The Press |
| `/wallet` | Playground crypto widgets on Arc |
| `/story/[slug]` | A Story |
| `/shelf/[handle]` | Profile |
| `/ledger` | The Piece claims |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter landing |
| `/onceuponers` | Handle directory |

## Network

Arc Testnet — chain ID `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`. Native gas USDC is 18 decimals. Pool USDC is the ERC-20 at `0x3600…0000` with 6 decimals. Do not mix them.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
