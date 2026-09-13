# OnceUpon

A token launchpad centered on **Arc**, with every other chain open. Launch on Arc, Solana, Ethereum, Base, or Robinhood Chain. Tokens print as SPL on Solana mainnet so they are live immediately against deep pairs — SOL, Bitcoin (cbBTC), Ether, stables, listed tokenized stocks, memes, or any mint. You do not fund an empty pool. Other chains tag the Story for a foreign pool binding.

Authors launch original Stories. Fees either push to the Author on every swap, or stream into an ownerless vault that holders claim as The Piece.

Identity is **X via Supabase**. Signing is your **connected Solana wallet** (Phantom, Solflare, or Backpack). That address is bound to your handle in Supabase. There is no in-app keypair.

## Launch types

- **Author** — Keep the pen. Fees land in the author’s wallet on every trade (0–3.00%).
- **OnceUponers** — Share the book. Fees land in an ownerless vault. Holders claim The Piece (author cap 1.00%). Optional auto-buy converts each vault cut into the pair you chose.
- **Venues** — SPL coin, NFT, Pump.fun-style curve, Pons-style pair launch. Same menu on every open chain, including Arc.
- **Quotes** — SOL, cbBTC, wETH, USDC/USDT/PYUSD, BONK/WIF/JUP/PENGU, listed tokenized stocks (xStocks), Ondo USDY/OUSG, or any mint. Buys settle in that quote. Pairing against a tokenized mint is a quote, not studio equity.
- Bonding graduates at **2 SOL** for SOL pairs, **5,000** for stables, **0.1** for cbBTC, and **10** of a listed xStock.

## Wallets

1. Sign in with X through Supabase.
2. Connect Phantom, Solflare, or Backpack.
3. Approve a short message (`OnceUpon:{userId}:{issuedAt}`). The pad stores that address on `user_wallets` as `kind: connected`.
4. Launch, curve trades, and Jupiter swaps are partial-signed on the server, then signed in your wallet and sent to Solana.

Curve keypairs (the bonding vault) stay encrypted in Supabase. They are not your wallet.

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
- `SUPABASE_SERVICE_ROLE_KEY` (avatar copier and service writes)
- `NEXT_PUBLIC_APP_URL`
- `SOLANA_RPC_URL` (optional, defaults to public mainnet-beta; use a dedicated RPC in production)
- `EMBEDDED_WALLET_SECRET` (optional extra entropy for **curve** key encryption — not a user wallet)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- `@solana/web3.js` + `@solana/spl-token` for real mainnet mints
- Injected Solana wallets bound through Supabase
- Jupiter Metis routing for quotes and swaps (`lite-api.jup.ag`)
- Foundry under `contracts/`

## Surfaces

| Path | Job |
| --- | --- |
| `/` | Home — Arc hero, chain chooser, feed |
| `/launch` | Choose a chain |
| `/launch/arc` | Arc press (default). Mint prints on Solana, tagged for Arc |
| `/launch/[chain]` | Solana / Ethereum / Base / Robinhood press |
| `/wallet` | Connected wallet plus Jupiter swap |
| `/you` | Profile, bound wallet, shortcuts |
| `/story/[slug]` | A live launch, curve trade, Jupiter, The Binding |
| `/shelf` | Own profile, or the crew if signed out |
| `/shelf/[handle]` | Public profile |
| `/ledger` | The Piece claims |
| `/bindings` | Author links a foreign pool (including native Arc when it exists) |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

## Network

**Arc (home chain)** — Stories tagged for Arc. Native factory binds later from `/bindings`. Explorer `https://testnet.arcscan.app`.

**Solana Mainnet (live printer)** — RPC `https://api.mainnet-beta.solana.com`, explorer `https://explorer.solana.com`, USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. CAIP-2 `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`. No faucet. Do not smoke-mint; RPC ping only (`pnpm smoke:solana`).

**Ethereum, Base, Robinhood Chain** — Stories tagged for those chains still mint as SPL on Solana today. Bind a foreign pool from `/bindings` after launch. Robinhood Pons factory `0x7ed598…`, router `0xe33e9e…`.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
