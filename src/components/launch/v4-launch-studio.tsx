"use client";

import { useState } from "react";
import { encodeFunctionData, encodeAbiParameters, parseAbiParameters } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { ARC_V4, FLAUNCH_ZAP_ABI } from "@onceupon/config/ubi-v4";

type Mode = "direct" | "fair";

export function V4LaunchStudio({ handle }: { handle: string | null }) {
  const [mode, setMode] = useState<Mode>("direct");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [xHandle, setXHandle] = useState(handle ? `@${handle}` : "");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setTxHash(null);
    try {
      const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
      if (!eth) throw new Error("Connect MetaMask or Rabby on Arc (5042).");
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const creator = accounts[0];
      if (!creator) throw new Error("No wallet.");
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_V4.hexChainId }] });
      } catch {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_V4.hexChainId,
              chainName: "Arc",
              nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
              rpcUrls: ["https://rpc.arc-scan.org"],
              blockExplorerUrls: [ARC_V4.explorer],
            },
          ],
        });
      }

      const fairPercent = mode === "fair" ? 50n : 0n;
      const supply = 1_000_000_000n * 10n ** 18n;
      const initialTokenFairLaunch = (supply * fairPercent) / 100n;
      const fairLaunchDuration = mode === "fair" ? 30n * 60n : 0n;
      const tokenUri = JSON.stringify({
        name,
        symbol,
        image: cover?.url ?? "",
        launchpad: "OrbitX",
        creatorX: xHandle.trim(),
        mode,
        antiSnipe: mode === "fair",
      });
      const initialPriceParams = encodeAbiParameters(parseAbiParameters("uint256"), [6_900n * 10n ** 6n]);
      const feeCalculatorParams = mode === "fair" ? encodeAbiParameters(parseAbiParameters("bool"), [true]) : "0x";
      const data = encodeFunctionData({
        abi: FLAUNCH_ZAP_ABI,
        functionName: "flaunch",
        args: [
          {
            name,
            symbol,
            tokenUri,
            initialTokenFairLaunch,
            fairLaunchDuration,
            premineAmount: 0n,
            creator: creator as `0x${string}`,
            creatorFeeAllocation: 8000,
            flaunchAt: 0n,
            initialPriceParams,
            feeCalculatorParams,
          },
        ],
      });
      const hash = (await eth.request({
        method: "eth_sendTransaction",
        params: [{ from: creator, to: ARC_V4.flaunchZap, data, value: "0x0" }],
      })) as string;
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "V4 launch failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void launch(event)} className="space-y-5 rounded-3xl border border-white/10 p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Arc · Uniswap v4</p>
        <h2 className="mt-1 text-2xl font-semibold">V4 launch desk</h2>
        <p className="mt-2 text-sm text-white/55">
          Same rails as UBI / eve on Arc mainnet 5042. Direct = live book from block one. Fair = same price window +
          anti-snipe. Creator slice can forward to an X handle. Pair is USDC. LP on Uniswap v4.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={mode === "direct" ? "default" : "outline"} onClick={() => setMode("direct")}>
          Direct Launch
        </Button>
        <Button type="button" variant={mode === "fair" ? "default" : "outline"} onClick={() => setMode("fair")}>
          Fair Launch · anti-snipe
        </Button>
      </div>
      <p className="text-sm text-white/50">
        {mode === "direct"
          ? "Price discovery from block one. Full float on a v4 USDC pool."
          : "Everyone enters at the same price for 30 minutes. Bid wall + anti-snipe before the book opens."}
      </p>
      <CoverField value={cover} onChange={setCover} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Ticker</Label>
          <Input className="mt-2" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Forward creator rewards to X</Label>
        <Input className="mt-2" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@handle" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Confirm in wallet…" : mode === "fair" ? "Fair launch on v4" : "Direct launch on v4"}
      </Button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {txHash ? (
        <p className="break-all text-sm text-white/70">
          Sent{" "}
          <a className="underline" href={`${ARC_V4.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      ) : null}
    </form>
  );
}
