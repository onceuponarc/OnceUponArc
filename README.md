# OnceUpon

A token launchpad. Solana is live on devnet. Authors launch original Stories. Fees either push to the Author on every swap, or stream into an ownerless vault that holders claim as The Piece.

This is a working Solana launchpad: X identity, an encrypted pad wallet per account, and real SPL / NFT mints on Solana devnet. Circle Arc and Robinhood Chain (Pons) share the same launch types and go live when those rails are wired.

## Launch types

- **Author** — Keep the pen. Fees land in the author’s wallet on every trade (0–3.00%).
- **OnceUponers** — Share the book. Fees land in an ownerless vault. Holders claim The Piece (author cap 1.00%). Optional auto-buy converts each vault cut into the pair you chose.
- **Venues** — SPL coin, NFT, Pump.fun-style curve, Pons-style pair launch. Same menu on every chain.
- **Quotes** — SOL, USDC, any meme/SPL mint, or a tokenized name when that mint exists (otherwise gated).
- Solana bonding graduates at **2 SOL** on devnet. Arc still uses **5,000 USDC** when that factory ships.

## Pad wallet

Sign-in with X creates a fresh Solana keypair. The secret is AES-256-GCM encrypted at rest in a table the browser cannot read. Export is an explicit POST. The pad never logs the key.

You can still connect an external wallet. Launches sign with the pad wallet so testnet mints actually land.

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
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (optional, Arc widgets)
- `SOLANA_RPC_URL` (optional, defaults to public devnet)
- `EMBEDDED_WALLET_SECRET` (optional extra entropy for pad-wallet encryption)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- `@solana/web3.js` + `@solana/spl-token` for real devnet mints
- thirdweb v5 crypto UI themed ink/gold against Arc testnet `5042002` (coming soon)
- Foundry under `contracts/`

## Surfaces

| Path | Job |
| --- | --- |
| `/` | Home feed — new, trending, on the curve, recently bonded |
| `/launch` | Working Solana launch studio (SPL, NFT, Pump-style, Pons-style) |
| `/wallet` | Pad wallet, export, airdrop, optional external connect |
| `/write` | Redirects to `/launch` |
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

**Solana Devnet (live)** — RPC `https://api.devnet.solana.com`, explorer `https://explorer.solana.com/?cluster=devnet`, faucet `https://faucet.solana.com`.

**Circle Arc (coming soon)** — chain ID `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`. Native gas USDC is 18 decimals. Pool USDC is the ERC-20 at `0x3600…0000` with 6 decimals. Do not mix them.

**Robinhood Chain / Pons (coming soon)** — factory `0x7ed598…`, router `0xe33e9e…`. Same launch form; prints when public RPC is wired.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
