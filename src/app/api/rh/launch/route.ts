import { NextResponse } from "next/server";
import { keccak256, toHex, zeroAddress, zeroHash } from "viem";
import { getSessionUser } from "@/lib/auth";
import { deskRhWallet } from "@/lib/wallets/rh-client";
import { PONS_FACTORY, PONS_FACTORY_ABI } from "@/lib/rh/pons";
import { RH } from "@onceupon/config/rh";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function normalizeUrl(raw: string | undefined, kind: "website" | "twitter" | "telegram", fallback = "") {
  const value = (raw ?? "").trim();
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  if (kind === "twitter") return `https://x.com/${value.replace(/^@/, "")}`;
  if (kind === "telegram") return `https://t.me/${value.replace(/^@/, "")}`;
  return `https://${value}`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      name?: string;
      symbol?: string;
      coverUrl?: string;
      description?: string;
      website?: string;
      twitter?: string;
      telegram?: string;
    };
    const name = (body.name ?? "").trim().slice(0, 32);
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 12);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const { wallet, pub, address } = await deskRhWallet(user.id);
    const balance = await pub.getBalance({ address });
    const fee = await pub.readContract({
      address: PONS_FACTORY,
      abi: PONS_FACTORY_ABI,
      functionName: "launchFee",
    });
    if (balance < fee) {
      return NextResponse.json(
        {
          error: `Fund your in-app Robinhood wallet. Need ETH at ${address} for the Pons launch fee + gas.`,
        },
        { status: 400 },
      );
    }

    const description = (body.description ?? "").trim() || "Launched on OrbitX";
    const twitterFallback = profile?.handle ? `https://x.com/${profile.handle}` : "";
    const twitter = normalizeUrl(body.twitter, "twitter", twitterFallback);
    const website = normalizeUrl(body.website, "website", "https://www.orbitx.world");
    const telegram = normalizeUrl(body.telegram, "telegram");

    const salt = keccak256(toHex(`${address}:${name}:${symbol}:${Date.now()}`));
    const args = [
      {
        name,
        symbol,
        logo: body.coverUrl ?? "",
        description,
        socials: {
          twitter,
          telegram,
          discord: "",
          website,
          farcaster: "",
        },
        creatorFeeRecipient: address,
        creatorTaxBps: 100,
        buybackEnabled: false,
        expectedEconomics: zeroHash,
        salt,
      },
      0n,
      zeroAddress,
    ] as const;

    // Simulate first so we get the deterministic (token, curve) addresses launchToken()
    // returns — sendTransaction alone only ever gives back a tx hash, which is why the
    // studio's success check (it requires body.token) was always failing before, even
    // when the on-chain launch itself succeeded.
    const { result, request: simulated } = await pub.simulateContract({
      address: PONS_FACTORY,
      abi: PONS_FACTORY_ABI,
      functionName: "launchToken",
      args,
      account: wallet.account,
      value: fee,
    });
    const [tokenAddress, curveAddress] = result;

    const hash = await wallet.writeContract(simulated);

    try {
      const supabase = await createClient();
      const slug = `${slugify(name) || slugify(symbol) || "token"}-${Math.random().toString(36).slice(2, 6)}`;
      await supabase.from("stories").insert({
        slug,
        title: name,
        ticker: symbol,
        blurb: description,
        cover_url: body.coverUrl ?? null,
        image_uri: body.coverUrl ?? null,
        website_url: website || null,
        twitter_url: twitter || null,
        telegram_url: telegram || null,
        author_user_id: user.id,
        author_wallet: address,
        engine: "author",
        status: "live",
        author_bps: 100,
        chain: "robinhood",
        venue: "pons",
        pair_class: "other",
        pair_label: "WETH",
        mint_decimals: 18,
        token_address: tokenAddress,
        vault_address: curveAddress,
        created_tx: hash,
      });
    } catch {
      // Don't block a successful on-chain launch on a DB write failure.
    }

    return NextResponse.json({
      hash,
      token: tokenAddress,
      curve: curveAddress,
      creator: address,
      feeRecipient: address,
      explorer: `${RH.explorer}/tx/${hash}`,
      venue: "pons-v2",
      note: "Pons v2 curve. Buy and sell from block one. Volume feeds the curve and graduates into a locked Uniswap v4 LP.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Robinhood launch failed." },
      { status: 400 },
    );
  }
}
