import { injectedAddress } from "../src/lib/wallets/injected-address.ts";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

assert(injectedAddress(undefined) === null, "undefined");
assert(injectedAddress(true) === null, "boolean");
assert(injectedAddress({}) === null, "empty");
assert(injectedAddress({ publicKey: undefined }) === null, "missing publicKey");
assert(injectedAddress("So11111111111111111111111111111111111111112") === "So11111111111111111111111111111111111111112", "string");
assert(
  injectedAddress({ toBase58: () => "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2" }) ===
    "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
  "toBase58",
);
assert(
  injectedAddress({ publicKey: { toBase58: () => "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE" } }) ===
    "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
  "nested publicKey",
);
assert(
  injectedAddress({ publicKey: "CeaZcxBNLpJWtxzt58qQmfMBtJY8pQLvursXTJYGQpbN" }) ===
    "CeaZcxBNLpJWtxzt58qQmfMBtJY8pQLvursXTJYGQpbN",
  "string publicKey",
);

console.log(JSON.stringify({ ok: true, helper: "injectedAddress" }));
