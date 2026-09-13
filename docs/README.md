# OnceUpon notes

Master product rules live in the operator brief (12 September 2026). Phase 0 in this repo:

- Isolated Supabase project `OnceUpon` / `txrdfjypnuvlyseefclj`
- X login via provider `x`
- Injected Solana wallets bound in Supabase (`kind: connected`)
- Arc-centered glass pad: Home, Launch, Trade, Claims, You
- Arc testnet config object in `packages/config/src/arc.ts`
- Fee bps caps in `contracts/src/FeeMath.sol`
- Chapter Curve identities in `contracts/src/ChapterMath.sol` (Arc) and `src/lib/solana/curve.ts` (Solana mirror)

The Chapter Curve supersedes seeded-AMM-at-launch. Create opens a tradable curve with `realQuote = 0`. Graduation seeds the AMM from the vault. Existing NVDAx/USDC books are hop-1 routing, never the Story pool.

Do not describe The Piece as a dividend. Do not offer studio equity. Quote creator fee cap is 300 bps in Author mode and 100 bps in OnceUponers mode.
