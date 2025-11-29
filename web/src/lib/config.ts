export const UNIPASS_CONTRACT = process.env.NEXT_PUBLIC_UNIPASS_CONTRACT ?? "0x0000000000000000000000000000000000000000";
export const UNIPASS_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "UniPass";

export const ENV_READY = Boolean(process.env.UNIPASS_RPC_URL && process.env.UNIPASS_RELAYER_KEY && process.env.NEXT_PUBLIC_UNIPASS_CONTRACT);

export const SERVER_CONFIG = {
  rpcUrl: process.env.UNIPASS_RPC_URL,
  relayerKey: process.env.UNIPASS_RELAYER_KEY,
  contract: process.env.NEXT_PUBLIC_UNIPASS_CONTRACT,
  chainId: UNIPASS_CHAIN_ID
};

