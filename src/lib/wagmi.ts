import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "viem/chains";
import { ARC_TESTNET } from "@onceupon/config/arc";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(ARC_TESTNET.rpcUrls[0]),
  },
  ssr: true,
});
