import { createThirdwebClient } from "thirdweb";
import { arcTestnet } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { darkTheme } from "thirdweb/react";
import { ARC_TESTNET } from "@onceupon/config/arc";

const PLACEHOLDER_CLIENT_ID = "onceupon_replace_me";

export const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || PLACEHOLDER_CLIENT_ID;

export const hasThirdwebClientId =
  Boolean(process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) &&
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID !== PLACEHOLDER_CLIENT_ID;

export const thirdwebClient = createThirdwebClient({
  clientId: thirdwebClientId,
});

export const arcChain = arcTestnet;

export const ARC_USDC_ERC20 = ARC_TESTNET.usdcErc20;
export const ARC_EURC = ARC_TESTNET.eurc;

export const onceUponWallets = [
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("walletConnect"),
];

export const onceUponAppMetadata = {
  name: "OnceUpon",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:43147",
  description: "A token launchpad. Solana mainnet prints. Arc testnet is live for wallets.",
};

/** Playground custom theme, remapped to OnceUpon ink / parchment / gold. */
export const onceUponThirdwebTheme = darkTheme({
  colors: {
    modalBg: "#0B0A12",
    modalOverlayBg: "rgba(11, 10, 18, 0.82)",
    borderColor: "rgba(201, 162, 39, 0.28)",
    separatorLine: "rgba(201, 162, 39, 0.18)",
    accentButtonBg: "#C9A227",
    accentButtonText: "#0B0A12",
    accentText: "#C9A227",
    primaryButtonBg: "#C9A227",
    primaryButtonText: "#0B0A12",
    primaryText: "#F6EFE2",
    secondaryText: "#CBBFA8",
    secondaryButtonBg: "#14131C",
    secondaryButtonText: "#F6EFE2",
    secondaryButtonHoverBg: "#1C1B24",
    connectedButtonBg: "#14131C",
    connectedButtonBgHover: "#1C1B24",
    secondaryIconColor: "#CBBFA8",
    secondaryIconHoverColor: "#F6EFE2",
    secondaryIconHoverBg: "#1C1B24",
    tertiaryBg: "#1C1B24",
    skeletonBg: "#1C1B24",
    selectedTextColor: "#0B0A12",
    selectedTextBg: "#C9A227",
    tooltipBg: "#14131C",
    tooltipText: "#F6EFE2",
    inputAutofillBg: "#1C1B24",
    scrollbarBg: "#1C1B24",
    danger: "#C45C5C",
    success: "#2A6B62",
  },
  fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
});
