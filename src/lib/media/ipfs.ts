const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const CID_V1 = /^bafy[a-z0-9]{20,}$/i;

export const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export function isCid(value: string) {
  const cid = value.trim();
  return CID_V0.test(cid) || CID_V1.test(cid);
}

export function parseIpfsInput(raw: string): { cid: string; gatewayUrl: string; uri: string } | null {
  const value = raw.trim();
  if (!value) return null;
  let cid = "";
  const ipfsUri = value.match(/^ipfs:\/\/+(?:ipfs\/)?([A-Za-z0-9]+)/i);
  const gateway = value.match(/(?:\/ipfs\/)([A-Za-z0-9]+)(?:[/?#]|$)/i);
  if (ipfsUri) cid = ipfsUri[1];
  else if (gateway) cid = gateway[1];
  else if (isCid(value)) cid = value;
  if (!cid || !isCid(cid)) return null;
  return { cid, gatewayUrl: `${IPFS_GATEWAY}/${cid}`, uri: `ipfs://${cid}` };
}

export function ipfsGatewayUrl(cid: string) {
  return `${IPFS_GATEWAY}/${cid.replace(/^ipfs:\/\//, "")}`;
}
