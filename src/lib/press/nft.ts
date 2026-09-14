import "server-only";

import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, createV1, transferV1 } from "@metaplex-foundation/mpl-core";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey, toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";

/** A throwaway offline Umi context, keyed to whichever keypair should pay/sign.
 *  We only use it to build instructions — sending/signing happens through the
 *  app's existing @solana/web3.js Transaction + sendSignedTx plumbing, so a
 *  Press Card NFT mint/transfer composes into the same tx pipeline as
 *  everything else (single source of truth for blockhash + submission). */
function umiFor(signerKeypair: Keypair) {
  const umi = createUmi(serverSolanaRpcs()[0]).use(mplCore());
  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(signerKeypair));
  umi.use(signerIdentity(signer));
  return { umi, signer };
}

/** Real, transferable Metaplex Core NFT representing ownership of one Press Card.
 *  `assetKeypair` is a fresh throwaway keypair — its public key becomes the
 *  permanent NFT/asset address (like a mint address). */
export async function buildMintPressCardIx(opts: {
  assetKeypair: Keypair;
  payer: Keypair;
  owner: PublicKey;
  name: string;
  uri: string;
}): Promise<TransactionInstruction[]> {
  const { umi, signer } = umiFor(opts.payer);
  const assetSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(opts.assetKeypair));
  const builder = createV1(umi, {
    asset: assetSigner,
    payer: signer,
    authority: signer,
    owner: fromWeb3JsPublicKey(opts.owner),
    name: opts.name.slice(0, 32),
    uri: opts.uri,
  });
  return builder.getInstructions().map(toWeb3JsInstruction);
}

/** Transfers a Press Card NFT. `currentOwner` must be the desk keypair that
 *  currently owns the asset — Core enforces this on-chain, so a wrong signer
 *  here fails the transaction rather than silently doing nothing. */
export async function buildTransferPressCardIx(opts: {
  assetMint: PublicKey;
  currentOwner: Keypair;
  newOwner: PublicKey;
}): Promise<TransactionInstruction[]> {
  const { umi, signer } = umiFor(opts.currentOwner);
  const builder = transferV1(umi, {
    asset: fromWeb3JsPublicKey(opts.assetMint),
    payer: signer,
    authority: signer,
    newOwner: fromWeb3JsPublicKey(opts.newOwner),
  });
  return builder.getInstructions().map(toWeb3JsInstruction);
}
