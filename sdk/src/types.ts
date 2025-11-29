import { z } from "zod";

export const PassportProofSchema = z.object({
  proof: z.string().min(1, "proof is required"),
  payload: z.string().optional(),
  signature: z.string().optional()
});

export type PassportProofPayload = z.infer<typeof PassportProofSchema>;

export interface IdentityArtifacts {
  /** base64 encoded private key exported from the Semaphore identity */
  privateKey: string;
  /** Poseidon hash commitment inserted into the UniPass Merkle tree */
  commitment: bigint;
  /** Secret scalar used to derive the nullifier / scope hashes */
  secretScalar: bigint;
}

export interface UniPassConfig {
  /** Deployed UniPassRegistry 合约地址 */
  contractAddress: string;
  /** EIP-155 chainId, 用于生成 deterministic scope */
  chainId: number;
  /** 可选：若在多组场景下复用，可覆盖 groupId */
  groupId?: bigint;
}

export interface RegistrationPayload {
  identity: IdentityArtifacts;
  proof: PassportProofPayload;
}

export interface ProofRequest {
  identity: IdentityArtifacts;
  appId: string;
  signal?: string;
}

