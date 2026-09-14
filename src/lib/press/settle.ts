import "server-only";

import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { parseEther } from "viem";
import { getCard, logActivity, resolveHandleUserId, setOfferStatus, transferCard } from "@/lib/cards/store";
import type { PressOffer, OfferStatus } from "@/lib/cards/types";
import { deskSolanaKey, deskEvmWallet } from "@/lib/wallets/sign-desk";
import { buildTransferPressCardIx } from "@/lib/press/nft";
import { sendSignedTx, waitForTx } from "@/lib/solana/partial-tx";
import { fetchLatestBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";

/**
 * Settlement, run the instant a seller accepts an offer.
 *
 * Every wallet in this deal is a desk wallet OrbitX custodies for both sides,
 * so there is no "buyer sends payment, we wait and hope" step the way a normal
 * NFT marketplace needs one: on Solana we build ONE transaction containing
 * both the payment transfer and the NFT transfer and sign it with both desk
 * keypairs, so it's atomic by construction — either the whole trade lands or
 * none of it does, verified directly from the confirmed transaction itself.
 * On Arc, payment and the (Solana) NFT transfer are two different chains, so
 * they're sequential — but still built and executed by us from both parties'
 * real desk keys, never a user-submitted tx hash we're asked to trust.
 */
export async function settleOffer(offer: PressOffer): Promise<{ status: OfferStatus; txSignature?: string; error?: string }> {
  const card = await getCard(offer.cardSlug);
  if (!card) return fail(offer, "Card no longer exists.");
  if (card.ownerHandle.toLowerCase() !== offer.sellerHandle.toLowerCase()) {
    return fail(offer, "Seller no longer owns this card — offer is stale.");
  }

  const buyerUserId = await resolveHandleUserId(offer.buyerHandle);
  const sellerUserId = await resolveHandleUserId(offer.sellerHandle);
  if (!buyerUserId || !sellerUserId) return fail(offer, "Could not resolve buyer/seller desk wallets.");

  try {
    if (card.payNetwork === "solana") {
      const buyerKey = await deskSolanaKey(buyerUserId);
      const sellerKey = await deskSolanaKey(sellerUserId);
      const ixs = [
        SystemProgram.transfer({
          fromPubkey: buyerKey.publicKey,
          toPubkey: sellerKey.publicKey,
          lamports: Math.round(offer.offerAmountUi * LAMPORTS_PER_SOL),
        }),
      ];
      if (card.nftMint) {
        const { PublicKey } = await import("@solana/web3.js");
        ixs.push(
          ...(await buildTransferPressCardIx({
            assetMint: new PublicKey(card.nftMint),
            currentOwner: sellerKey,
            newOwner: buyerKey.publicKey,
          })),
        );
      }
      const tx = new Transaction().add(...ixs);
      const latest = await fetchLatestBlockhash(serverSolanaRpcs());
      tx.feePayer = buyerKey.publicKey;
      tx.recentBlockhash = latest.blockhash;
      tx.sign(buyerKey, sellerKey);
      const sig = await sendSignedTx(tx.serialize().toString("base64"));
      await waitForTx(sig);
      return complete(offer, sig, card.slug, buyerKey.publicKey.toBase58());
    }

    // Arc: native transfer is USDC itself on Arc mainnet (USDC is the gas token).
    const buyerEvm = await deskEvmWallet(buyerUserId);
    const sellerEvm = await deskEvmWallet(sellerUserId);
    const hash = await buyerEvm.wallet.sendTransaction({
      account: buyerEvm.wallet.account,
      to: sellerEvm.address,
      value: parseEther(String(offer.offerAmountUi)),
      chain: buyerEvm.wallet.chain,
    });

    if (card.nftMint) {
      try {
        const sellerSolKey = await deskSolanaKey(sellerUserId);
        const buyerSolKey = await deskSolanaKey(buyerUserId);
        const { PublicKey } = await import("@solana/web3.js");
        const ixs = await buildTransferPressCardIx({
          assetMint: new PublicKey(card.nftMint),
          currentOwner: sellerSolKey,
          newOwner: buyerSolKey.publicKey,
        });
        const tx = new Transaction().add(...ixs);
        const latest = await fetchLatestBlockhash(serverSolanaRpcs());
        tx.feePayer = sellerSolKey.publicKey;
        tx.recentBlockhash = latest.blockhash;
        tx.sign(sellerSolKey);
        const nftSig = await sendSignedTx(tx.serialize().toString("base64"));
        await waitForTx(nftSig);
        return complete(offer, hash, card.slug, buyerEvm.address, nftSig);
      } catch (nftError) {
        // Payment already landed for real — do not pretend the trade failed.
        await setOfferStatus(offer.id, "accepted", {
          status: "transfer_pending",
          txSignature: hash,
          failReason: nftError instanceof Error ? nftError.message : "NFT transfer pending retry.",
        });
        await logActivity({
          cardSlug: card.slug,
          kind: "payment_confirmed_transfer_pending",
          detail: { buyer: offer.buyerHandle, seller: offer.sellerHandle, amount: offer.offerAmountUi },
          txSignature: hash,
        });
        return { status: "transfer_pending", txSignature: hash, error: "Payment confirmed; NFT transfer needs a retry." };
      }
    }
    return complete(offer, hash, card.slug, buyerEvm.address);
  } catch (error) {
    return fail(offer, error instanceof Error ? error.message : "Settlement failed.");
  }
}

async function complete(offer: PressOffer, sig: string, slug: string, buyerWallet: string, secondSig?: string) {
  await setOfferStatus(offer.id, "accepted", { status: "completed", txSignature: sig });
  await transferCard(slug, offer.buyerHandle, sig);
  await logActivity({
    cardSlug: slug,
    kind: "sale",
    detail: { buyer: offer.buyerHandle, seller: offer.sellerHandle, amount: offer.offerAmountUi, buyerWallet, secondSig },
    txSignature: sig,
  });
  return { status: "completed" as OfferStatus, txSignature: sig };
}

async function fail(offer: PressOffer, reason: string) {
  await setOfferStatus(offer.id, ["open", "accepted"], { status: "failed", failReason: reason }).catch(() => undefined);
  await logActivity({ cardSlug: offer.cardSlug, kind: "settlement_failed", detail: { reason } });
  return { status: "failed" as OfferStatus, error: reason };
}
