import { Identity } from "@semaphore-protocol/identity";
import { keccak256, toUtf8Bytes } from "ethers";
import { poseidon2 } from "poseidon-lite/poseidon2";
import type { IdentityArtifacts } from "./types.js";

const HASH_TRUNCATION = BigInt(1) << BigInt(248);

function formatScope(scope: string | bigint): bigint {
  if (typeof scope === "bigint") {
    return scope;
  }

  const hashed = keccak256(toUtf8Bytes(scope));
  return (BigInt(hashed) >> BigInt(8)) % HASH_TRUNCATION;
}

export function deriveIdentity(seed?: string): IdentityArtifacts {
  const identity = new Identity(seed);

  return {
    privateKey: identity.export(),
    commitment: identity.commitment,
    secretScalar: identity.secretScalar
  };
}

export function importIdentity(base64Key: string): IdentityArtifacts {
  const identity = Identity.import(base64Key);

  return {
    privateKey: base64Key,
    commitment: identity.commitment,
    secretScalar: identity.secretScalar
  };
}

export function computeNullifier(secretScalar: bigint, scope: string | bigint): bigint {
  const scopeField = formatScope(scope);
  return poseidon2([secretScalar, scopeField]);
}

