# OnceUpon

A token launchpad on **Arc**. Launch a USDC bonding curve the instant create lands. Buyers pay USDC into the vault. Graduation opens the pool from those reserves.

Identity is **X via Supabase**. Generate separate Arc **Devnet** and **Mainnet** keys on `/wallet`, import them into MetaMask or Rabby, and fund Devnet from the pad faucet.

The pad installs as a **PWA**.

## Launch types

- **Chapter on Arc** — Native Chapter Factory. Quote is USDC (MockUSDC on Devnet, Circle USDC on Testnet). You set the graduate target. 80% of supply trades on the curve; 20% is reserved for the book at graduation.
- **Creator fees** — Your cut (0–3.00%) is pushed to the Arc wallet on every buy and sell. Protocol takes 0.20% on top. Curve fees cap at 4.00%.
- **Holder claims** — Trades take only the protocol cut. The author deposits USDC into the vault. Holders claim a share proportional to circulating holdings. That is not a dividend.
- **Chapter Curve** — Create mints the token, curve, and vaults with `realQuote = 0`. Buyers pay USDC; fees come off input; net stays in the vault. At the graduate target the vault seeds the AMM.
- Default USDC Chapter: start cap **$3,000**, graduate **$5,000**.

OnceUpon does not print on Solana or Robinhood Chain. Leftover Story URLs still load.

## Wallets

1. Open `/wallet` and generate two keys — Devnet and Mainnet. They never leave this browser.
2. Import each hex key into **MetaMask** or **Rabby** (Account menu → Import account → Private key).
3. Add networks:
   - Arc Devnet — RPC `http://127.0.0.1:8546`, chain ID `31337`, symbol ETH
   - Arc Testnet — RPC `https://rpc.testnet.arc.io`, chain ID `5042002`, symbol USDC, explorer `https://testnet.arcscan.app`
4. On Devnet, click **Fund Devnet** to mint USDC and send ETH from the local factory.
5. Do not reuse a Devnet key on mainnet.

The pad can still sign with the funded Anvil trader while you test. Your imported key is what you take live.

## What this repo is not

OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else. Childhood language is aesthetic. Holder claims are a share of an author-funded pool — not a dividend.

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

Arc Devnet (Anvil + Chapter Factory + funded test wallet):

```bash
export PATH="$PATH:$HOME/.foundry/bin"
pnpm arc:devnet
```

That starts Anvil on `127.0.0.1:8546`, deploys `ChapterFactory` + MockUSDC, and mints **1,000,000 test USDC** to the pad wallet. `pnpm dev` runs the same ensure step first. Status, launch, and trade also bring Devnet up locally if Anvil died. Chain state is saved to `data/anvil-state.json` so a restart keeps the same factory and curves. Then launch / buy / sell from `/launch/arc` and any Arc Story.

Required env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (avatar copier and service writes)
- `NEXT_PUBLIC_APP_URL`
- `PINATA_JWT` (optional — pin coin art to IPFS)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- Foundry under `contracts/` (`pnpm test:forge` — Chapter Curve invariants)
- viem for Arc Devnet launch / buy / sell
- PWA (`/manifest.webmanifest` + `/sw.js`)

## Surfaces

| Path | Job |
| --- | --- |
| `/` | Home — live tape, token board, charts |
| `/launch` | Redirects to the Arc press |
| `/launch/arc` | Native Arc Chapter (Devnet wallet) |
| `/story/[slug]` | Chart, holders, live buys/sells, trade dock |
| `/wallet` | Generate / import Arc Devnet + Mainnet keys |
| `/tools` | Fees, graduation math, add Arc to MetaMask |
| `/terms` | Terms |
| `/privacy` | Privacy |
| `/you` | Profile, Arc wallet, shortcuts |
| `/shelf` | Own profile, or the crew if signed out |
| `/shelf/[handle]` | Public profile |
| `/ledger` | The Piece claims |
| `/bindings` | Tag an existing Arc pool |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

`/launch/solana` and `/launch/robinhood` redirect to `/launch/arc`.

## Network

**Arc (the press)** — Native Chapter Factory on Devnet (`pnpm arc:devnet`, RPC `http://127.0.0.1:8546`). Public testnet RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`, Circle faucet `https://faucet.circle.com`. Mainnet Arc is days out.

## Apply schema

```bash
pnpm sql:apply
```

That stamps `supabase/migrations` onto the isolated OnceUpon project through the IPv4 session-mode pooler (`aws-0-us-east-1.pooler.supabase.com:5432`). Direct `db.*.supabase.co:5432` is IPv6-only from some hosts. `0001` is skipped when `public.stories` already exists; `0002`–`0007` are idempotent (`IF NOT EXISTS` / `DROP IF EXISTS`).

You can also `npx supabase db push --linked` from a machine that can reach the direct DB host.

Never run these against the OrbitX/Soltools project. Arc launches write `stories` + `trades` with the service role (unsigned Devnet prints keep `author_user_id` null). Local `data/arc-stories.json` is a cache; Postgres is the source of truth on Vercel.
