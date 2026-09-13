# OnceUpon

A token launchpad centered on **Arc**, with every other chain open. Launch on Arc, Solana, Ethereum, Base, or Robinhood Chain. Tokens print as **full SPL** on Solana mainnet — you set supply, decimals, metadata, start price, and tokenomics — then pair into deep liquidity (SOL, Bitcoin, Ether, stables, stocks, ETFs, treasuries, bonds, memes, or any mint / pool). You do not fund an empty pool. Other chains tag the Story and bind a destination-chain pool.

Identity is **X via Supabase**. Signing is your **connected Solana wallet** (Phantom, Solflare, or Backpack). That address is bound to your handle in Supabase. There is no in-app keypair.

## Launch types

- **SPL coin** — The default printer. Real Solana mint with Metaplex metadata. You set supply, decimals, virtual depth (start price), and bond target. Pair against a stock, ETF, treasury, bond, SOL, or any live pool. This is not Pump.fun.
- **NFT** — Decimals zero, editions 1–10,000, no bonding curve.
- **PumpSwap pair** — Still a real SPL mint. Linked AMM is PumpSwap (`pAMMBay6…`), not the Pump.fun program.
- **Pons pair** — Still a real SPL mint, tagged for Robinhood Chain / Pons.
- **Creator fees** — Your cut (0–3.00%) is pushed to your wallet on every buy and sell. Protocol takes 0.20% on top.
- **Holder claims** — Trades take only the protocol cut. The author deposits quote/SOL into the vault. Holders claim a share proportional to circulating holdings. That is not a dividend.
- **Coin art** — Required for PumpSwap-pair launches; optional (recommended) for SPL. Upload a PNG/JPEG/WebP or paste an IPFS CID.
- **Metadata** — Each mint writes Metaplex Token Metadata on-chain. The URI is `https://once-upon-arc.vercel.app/api/token/<mint>/metadata`.
- **Quotes** — SOL, cbBTC, wETH, USDC/USDT/PYUSD, BONK/WIF/JUP/PENGU, listed tokenized stocks (xStocks such as **NVDAx**), ETFs (SPYx, QQQx), Ondo USDY/OUSG, or any mint. Pairing against a tokenized mint is a quote, not studio equity.
- **Linked pools** — Every launch binds the live DEX pool you pick. Solana uses Raydium / Orca / Meteora / PumpSwap. Ethereum uses Uniswap V2/V3. Base uses Uniswap V3 and Aerodrome. Arc uses Uniswap V2/V3/V4 on chain 5042. Robinhood Chain uses the Pons V2 factory.
- Default bond targets: **2 SOL**, **5,000** stables, **0.1** cbBTC, **10** of a listed xStock/ETF — editable at print.

## Wallets

1. Sign in with X through Supabase.
2. Connect Phantom, Solflare, or Backpack.
3. Approve a short message (`OnceUpon:{userId}:{issuedAt}`). The pad stores that address on `user_wallets` as `kind: connected`.
4. Launch, curve trades, and Jupiter swaps are partial-signed on the server, then signed in your wallet and sent to Solana.

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

Required env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (avatar copier and service writes)
- `NEXT_PUBLIC_APP_URL`
- `SOLANA_RPC_URL` (optional, defaults to public mainnet-beta; use a dedicated RPC in production)
- `EMBEDDED_WALLET_SECRET` (optional extra entropy for **curve** key encryption — not a user wallet)
- `PINATA_JWT` (optional — pin coin art to IPFS)

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
| `/bindings` | Author links another pool (Solana, Arc, Ethereum, Base, Robinhood) |
| `/margin` | Jupiter doorway |
| `/chapter/the-first-chapter` | First Chapter window |
| `/onceuponers` | Crew directory |
| `/auth/login` | Sign in with X |

## Network

**Arc (home chain)** — Stories tagged for Arc. Uniswap V2 factory `0x89e5db8b…`, V3 `0xf0db7b58…`, V4 PoolManager `0x8366a39c…` on chain 5042. Link an Arc pool at launch. Testnet explorer `https://testnet.arcscan.app`.

**Solana Mainnet (live printer)** — RPC `https://api.mainnet-beta.solana.com`, explorer `https://explorer.solana.com`, USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. CAIP-2 `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`. Factories: Raydium AMM `675kPX9…`, CPMM `CPMMoo8L3…`, CLMM `CAMMCzo5…`, Orca `whirLbMi…`, Meteora DLMM `LBUZKhRx…`, PumpSwap `pAMMBay6…`. Canonical SOL/USDC Raydium `58oQChx4…`. Canonical PumpSwap SOL/USDC `Gf7sXMoP…`. Canonical NVDAx/USDC Raydium `49iMatQ…`. No faucet. Do not smoke-mint; RPC ping only (`pnpm smoke:solana`). Prove pool catalogs with `pnpm check:pools`.

**Ethereum, Base, Robinhood Chain** — Stories tagged for those chains still mint as SPL on Solana today. Pick a destination pool at launch (Uniswap WETH/USDC `0x88e6A0c2…` on Ethereum, Uniswap WETH/USDC `0x6c561b44…` or Aerodrome cbBTC/WETH `0x70aCDF2A…` on Base, Pons factory `0x7ed598…` on Robinhood Chain). RPC for Robinhood Chain: `https://rpc.mainnet.chain.robinhood.com`.

## Apply schema

```bash
npx supabase db push --linked
```

Migrations live in `supabase/migrations`. Never run them against the OrbitX/Soltools project.
