const PUMP_LOCAL = "https://pumpportal.fun/api/trade-local";

export async function pumpCreateTx(input: {
  publicKey: string;
  name: string;
  symbol: string;
  metadataUri: string;
  mint: string;
  devBuySol: number;
}) {
  const res = await fetch(PUMP_LOCAL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: input.publicKey,
      action: "create",
      tokenMetadata: {
        name: input.name,
        symbol: input.symbol,
        uri: input.metadataUri,
      },
      mint: input.mint,
      denominatedInSol: "true",
      amount: input.devBuySol,
      slippage: 15,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Pump.fun would not build the create tx.");
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}

export async function pumpCollectFeeTx(publicKey: string) {
  const res = await fetch(PUMP_LOCAL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      action: "collectCreatorFee",
      priorityFee: 0.0002,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Could not build the fee-claim tx.");
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}

export async function pumpBuyTx(input: { publicKey: string; mint: string; solAmount: number; slippage?: number }) {
  const res = await fetch(PUMP_LOCAL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: input.publicKey,
      action: "buy",
      mint: input.mint,
      denominatedInSol: "true",
      amount: input.solAmount,
      slippage: input.slippage ?? 15,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Pump.fun would not build the dev-buy tx.");
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}
