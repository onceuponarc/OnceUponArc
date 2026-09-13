"use strict";

/** Pure-JS stand-in for the native bigint-buffer addon. Vercel cannot load the .node binary. */

function toBufferLE(num, width) {
  let hex = BigInt(num).toString(16);
  if (hex.length % 2) hex = `0${hex}`;
  hex = hex.padStart(width * 2, "0").slice(-width * 2);
  const buf = Buffer.from(hex, "hex");
  return Buffer.from(buf.reverse());
}

function toBufferBE(num, width) {
  return Buffer.from(toBufferLE(num, width).reverse());
}

function toBigIntLE(buf) {
  const hex = Buffer.from(buf).reverse().toString("hex") || "0";
  return BigInt(`0x${hex}`);
}

function toBigIntBE(buf) {
  const hex = Buffer.from(buf).toString("hex") || "0";
  return BigInt(`0x${hex}`);
}

module.exports = { toBufferLE, toBufferBE, toBigIntLE, toBigIntBE };
