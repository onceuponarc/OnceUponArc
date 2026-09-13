export async function readApiJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.status >= 400
        ? `The pad did not answer (${res.status}). Retry.`
        : "The pad returned an empty reply. Retry.",
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`The pad returned a broken reply (${res.status}). Retry.`);
  }
}
