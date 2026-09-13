# OnceUpon

A social token launchpad on **Arc**. Launch on Arc (native Chapter Curve), Solana (SPL Chapter Curve), or Robinhood Chain (Pons hop-1). Arc Chapters are tradable the instant create lands — buyers pay USDC, the vault holds it. The Author does not seed an AMM at print. Graduation opens the book from those vault reserves. Solana prints a full SPL mint on the same curve math. Robinhood Chain tags the Story and binds a Pons pool as hop-1 routing.

Identity is **X via Supabase**. Solana signing is your **connected wallet** (Phantom, Solflare, or Backpack). Arc Devnet uses a funded test wallet so you can launch, buy, and sell before mainnet Arc.

The pad installs as a **PWA**.

## Launch types

- **SPL coin** — The default printer. Real Solana mint with Metaplex metadata. You set supply, decimals, start cap, and graduate target. 80% of supply trades on the curve; 20% is reserved for the book at graduation. Pair against a stock, ETF, treasury, bond, SOL, or any quote. This is not Pump.fun.
- **NFT** — Decimals zero, editions 1–10,000, no bonding curve.
- **PumpSwap pair** — Still a real SPL mint. The Chapter Curve is the launch path. PumpSwap (`pAMMBay6…`) opens from the vault at graduation, not a two-sided seed at print. That is not the Pump.fun program.
- **Pons pair** — Still a real SPL mint, tagged for Robinhood Chain / Pons.
- **Creator fees** — Your cut (0–3.00%) is pushed to your wallet on every buy and sell. Protocol takes 0.20% on top. Curve fees cap at 4.00%.
- **Holder claims** — Trades take only the protocol cut. The author deposits quote/SOL into the vault. Holders claim a share proportional to circulating holdings. That is not a dividend.
- **Coin art** — Required for PumpSwap-pair launches; optional (recommended) for SPL. Upload a PNG/JPEG/WebP or paste an IPFS CID.
- **Metadata** — Each mint writes Metaplex Token Metadata on-chain. The URI is `https://once-upon-arc.vercel.app/api/token/<mint>/metadata`.
- **Quotes** — SOL, cbBTC, wETH, USDC/USDT/PYUSD, BONK/WIF/JUP/PENGU, listed tokenized stocks (xStocks such as **NVDAx**), ETFs (SPYx, QQQx), Ondo USDY/OUSG, or any mint. Pairing against a tokenized mint is a quote, not studio equity.
- **Chapter Curve** — Create mints the token, metadata, curve, and vaults with `realQuote = 0`. Buyers pay quote; fees come off input; net stays in the vault. You cannot eat the LP reserve unless the buy also graduates. Sell cannot pay virtual quote. At the graduate target the vault seeds the AMM and mint authority is burned.
- **Hop-1 routing** — Binding an existing NVDAx/USDC (or SOL/USDC) market only tags quote depth — it does not put your mint in that pool. That book is never the Story market.
- **Linked pools** — Optional hop-1 tags for Raydium / Orca / Meteora / PumpSwap / Pons. Arc uses Uniswap V2/V3/V4 on chain 5042. Robinhood Chain uses the Pons V2 factory.
- Default USDC Chapter: start cap **$3,000** (virtual quote ≈ **3,219**), graduate **$5,000**. SOL defaults **2 SOL** graduate / **30 SOL** start cap. cbBTC **0.1**, listed xStock/ETF **10** — editable at print.

## Wallets

1. Sign in with X through Supabase.
2. Connect Phantom, Solflare, or Backpack.
3. Approve a short message (`OnceUpon:{userId}:{issuedAt}`). The pad stores that address on `user_wallets` as `kind: connected`.
4. Launch, curve trades, vault graduation, and Jupiter swaps are extra-signed on the server, then your wallet **signs and pays** them (`signAndSendTransaction` in Phantom, Solflare, or Backpack). Graduation spends rent and gas; quote comes from the vault. The browser fetches a recent blockhash so Vercel does not have to talk to public Solana RPC just to print.

Curve keypairs (the bonding vault) stay encrypted in Supabase. They are not your wallet.

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

That starts Anvil on `127.0.0.1:8546`, deploys `ChapterFactory` + MockUSDC, and mints **1,000,000 test USDC** to the pad wallet. Then launch / buy / sell from `/launch/arc` and any Arc Story.

Required env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (avatar copier and service writes)
- `NEXT_PUBLIC_APP_URL`
- `SOLANA_RPC_URL` (optional, defaults to public mainnet-beta then PublicNode; use a dedicated RPC in production)
- `NEXT_PUBLIC_SOLANA_RPC_URL` (optional browser RPC for blockhash / wallet send fallbacks)
- `EMBEDDED_WALLET_SECRET` (optional extra entropy for **curve** key encryption — not a user wallet)
- `PINATA_JWT` (optional — pin coin art to IPFS)

Production: https://once-upon-arc.vercel.app/

## Stack

- Next.js App Router + Tailwind + shadcn/ui
- Supabase Auth (provider `x`, PKCE) + Postgres + Storage
- `@solana/web3.js` + `@solana/spl-token` + `@pump-fun/pump-swap-sdk` for real mainnet mints and vault-seeded PumpSwap at graduation
- Injected Solana wallets bound through Supabase
- Jupiter Metis routing for quotes and swaps (`lite-api.jup.ag`)
- Foundry under `contracts/` (`pnpm test:forge` — Chapter Curve invariants)
- viem for Arc Devnet launch / buy / sell
- PWA (`/manifest.webmanifest` + `/sw.js`)

## Surfaces

| Path | Job |
| --- | --- |
| `/` | Home — live tape, token board, charts |
| `/launch` | Choose Arc, Solana, or Robinhood Chain |
| `/launch/arc` | Native Arc Chapter (Devnet wallet) |
| `/launch/solana` | SPL printer |
| `/launch/robinhood` | Pons-tagged SPL |
| `/story/[slug]` | Chart, holders, live buys/sells, trade dock |
| `/wallet` | Arc test wallet + Jupiter |
| `/you` | Profile, bound wallet, shortcuts |
| `/shelf` | Own profile, or the crew if signed out |
| `/shelf/[handle]` | Public profile |
| `/ledger` | The Piece claims |
| `/bindings` | Tag an existing pool. Real PumpSwap LP is signed from the Story |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

## Network

**Arc (home chain)** — Native Chapter Factory on Devnet (`pnpm arc:devnet`, RPC `http://127.0.0.1:8546`). Public testnet RPC `https://rpc.testnet.arc.io`, explorer `https://testnet.arcscan.app`, Circle faucet `https://faucet.circle.com`. Mainnet Arc is days out. Uniswap V2/V3/V4 on chain 5042 are hop-1 tags, not the Story pool.

**Solana Mainnet (live printer)** — RPC `https://api.mainnet-beta.solana.com`, explorer `https://explorer.solana.com`, USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. CAIP-2 `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`. Factories: Raydium AMM `675kPX9…`, CPMM `CPMMoo8L3…`, CLMM `CAMMCzo5…`, Orca `whirLbMi…`, Meteora DLMM `LBUZKhRx…`, PumpSwap `pAMMBay6…`. Canonical SOL/USDC Raydium `58oQChx4…`. Canonical PumpSwap SOL/USDC `Gf7sXMoP…`. Canonical NVDAx/USDC Raydium `49iMatQ…`. No faucet. Do not smoke-mint; RPC ping only (`pnpm smoke:solana`). Prove pool catalogs with `pnpm check:pools`.

**Robinhood Chain** — Pons hop-1. Factory `0x7ed598…`, router `0xe33e9e47…`, RPC `https://rpc.mainnet.chain.robinhood.com`. The mint still prints as SPL on Solana so the Chapter is live immediately.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
