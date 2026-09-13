import { readApiJson } from "../src/lib/http/read-json.ts";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const empty = await readApiJson(new Response("", { status: 502 })).then(
  () => "ok",
  (err: Error) => err.message,
);
assert(empty.includes("502"), `empty 502: ${empty}`);

const broken = await readApiJson(new Response("<html>", { status: 500 })).then(
  () => "ok",
  (err: Error) => err.message,
);
assert(broken.includes("broken"), `html 500: ${broken}`);

const parsed = await readApiJson<{ error: string }>(
  new Response(JSON.stringify({ error: "Sign in with X first." }), { status: 401 }),
);
assert(parsed.error.includes("Sign in"), "json body");

console.log(JSON.stringify({ ok: true, helper: "readApiJson" }));
