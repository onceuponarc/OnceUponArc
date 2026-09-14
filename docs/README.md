# OrbitX notes

Master product rules live in the operator brief. Phase 0 in this repo:

- Isolated Supabase project `OrbitX` / `txrdfjypnuvlyseefclj`
- X login via provider `x`
- Arc-only press: Home, Launch, Trade, Claims, You
- Arc testnet config object in `packages/config/src/arc.ts`
- Fee bps caps in `contracts/src/FeeMath.sol`
- Chapter Curve identities in `contracts/src/ChapterMath.sol`

The Chapter Curve supersedes seeded-AMM-at-launch. Create opens a tradable curve with `realQuote = 0`. Graduation seeds the AMM from the vault.

Do not describe The Piece as a dividend. Do not offer studio equity. Quote creator fee cap is 300 bps in Author mode and 100 bps in OrbitXers mode. OrbitX prints on Arc only.
