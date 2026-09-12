import { CryptoPlayground } from "@/components/crypto/playground";
import { ThirdwebKeyNotice } from "@/components/crypto/key-notice";
import { ArcQuoteRow } from "@/components/crypto/headless";

export const metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Wallet</p>
        <h1 className="font-heading mt-2 text-4xl">Bind an Arc wallet</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Every crypto widget from the thirdweb playground, skinned in OnceUpon ink and gold. A
          OnceUponer is still an X account. The wallet is the second step — MetaMask, Rabby,
          Coinbase, Rainbow. No in-app email login.
        </p>
        <div className="mt-4 space-y-4">
          <ArcQuoteRow />
          <ThirdwebKeyNotice />
        </div>
      </div>
      <CryptoPlayground />
    </div>
  );
}
