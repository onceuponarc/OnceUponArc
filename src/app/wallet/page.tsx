import { CryptoPlayground } from "@/components/crypto/playground";
import { ThirdwebKeyNotice } from "@/components/crypto/key-notice";
import { ArcQuoteRow } from "@/components/crypto/headless";

export const metadata = { title: "Trade" };

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Trade</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Connect. Fund. Swap.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Bind an Arc wallet under your X identity. MetaMask, Rabby, Coinbase, Rainbow — no in-app email
          wallets. Buy and swap against pool USDC on testnet.
        </p>
        <div className="mt-4 space-y-4">
          <ArcQuoteRow />
          <ThirdwebKeyNotice />
        </div>
      </section>
      <CryptoPlayground />
    </div>
  );
}
