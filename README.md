# OnceUpon

A token launchpad. Solana, Ethereum, Base, and Robinhood Chain are open. Tokens print on Solana mainnet today so a Story is live immediately. Other chains tag the launch for a foreign pool binding. Circle Arc is not open for launches yet.

Authors launch original Stories. Fees either push to the Author on every swap, or stream into an ownerless vault that holders claim as The Piece.

This is a working Solana printer: X identity, an encrypted pad wallet per account, and real SPL / NFT mints on Solana mainnet.

## Launch types

- **Author** — Keep the pen. Fees land in the author’s wallet on every trade (0–3.00%).
- **OnceUponers** — Share the book. Fees land in an ownerless vault. Holders claim The Piece (author cap 1.00%). Optional auto-buy converts each vault cut into the pair you chose.
- **Venues** — SPL coin, NFT, Pump.fun-style curve, Pons-style pair launch. Same menu on every open chain.
- **Quotes** — SOL, USDC/USDT/PYUSD, listed tokenized stocks (xStocks), Ondo USDY/OUSG, or any mint. Buys settle in that quote. Pairing against a tokenized mint is a quote, not studio equity.
- Solana bonding graduates at **2 SOL** for SOL pairs, **5,000** for stables, and **10** of a listed xStock.

## Pad wallet

Sign in with X through Supabase. That login is the wallet connection: the pad creates a Solana keypair, encrypts it AES-256-GCM at rest in a table the browser cannot read, and uses it to sign Jupiter swaps and launches. Export is an explicit POST. Fund the address with real SOL — there is no faucet and no injected wallet.

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
- `SOLANA_RPC_URL` (optional, defaults to public mainnet-beta; use a dedicated RPC in production)
- `EMBEDDED_WALLET_SECRET` (optional extra entropy for pad-wallet encryption)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- `@solana/web3.js` + `@solana/spl-token` for real mainnet mints
- Pad wallet in Supabase (created on X login — no injected wallets)
- Jupiter Metis routing for quotes and swaps (`lite-api.jup.ag`)
- Foundry under `contracts/`

## Surfaces

| Path | Job |
| --- | --- |
| `/` | The Desk — feed plus chain chooser |
| `/launch` | Choose a chain |
| `/launch/solana` | Working Solana press (form visible without login) |
| `/launch/[chain]` | Press for Ethereum, Base, Robinhood; Arc shows not yet |
| `/wallet` | Supabase pad wallet plus Jupiter swap |
| `/write` `/press` | Redirect to `/launch` |
| `/desk` | Redirect to `/` |
| `/trade` | Redirect to `/wallet` |
| `/claims` | Redirect to `/ledger` |
| `/story/[slug]` | A live launch plus The Binding |
| `/shelf` | Own profile, or the crew if signed out |
| `/shelf/[handle]` | Public profile |
| `/ledger` | The Piece claims |
| `/bindings` | Author links a foreign pool |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

## Network

**Solana Mainnet (live printer)** — RPC `https://api.mainnet-beta.solana.com`, explorer `https://explorer.solana.com`, USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. CAIP-2 `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`. No faucet. Do not smoke-mint; RPC ping only (`pnpm smoke:solana`).

**Ethereum, Base, Robinhood Chain (open)** — Stories tagged for those chains still mint as SPL on Solana today. Bind a foreign pool from `/bindings` after launch. Robinhood Pons factory `0x7ed598…`, router `0xe33e9e…`.

**Circle Arc (not yet)** — chain ID `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`. Token factory is not deployed. Launches are closed until it ships.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
