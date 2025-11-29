import { Contract, type Provider, type Signer } from "ethers";
import { PassportProofSchema, type RegistrationPayload, type UniPassConfig } from "./types.js";

export type SemaphoreProofStruct = {
  merkleTreeDepth: bigint;
  merkleTreeRoot: bigint;
  nullifier: bigint;
  message: bigint;
  scope: bigint;
  points: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

const UNIPASS_REGISTRY_ABI = [
  "function registerIdentity(uint256 identityCommitment, bytes passportProof) returns (uint256)",
  "function validateUniPassProof((uint256,uint256,uint256,uint256,uint256,uint256[8]) proof)",
  "function verifyUniPassProof((uint256,uint256,uint256,uint256,uint256,uint256[8]) proof) view returns (bool)",
  "function currentMerkleRoot() view returns (uint256)",
  "function memberCount() view returns (uint256)",
  "function groupId() view returns (uint256)",
  "function isRegistered(uint256 identityCommitment) view returns (bool)"
];

export class UniPassClient {
  private readonly contract: Contract;
  readonly config: UniPassConfig;

  constructor(config: UniPassConfig, signerOrProvider: Signer | Provider) {
    this.config = config;
    this.contract = new Contract(config.contractAddress, UNIPASS_REGISTRY_ABI, signerOrProvider);
  }

  async register(payload: RegistrationPayload) {
    PassportProofSchema.parse(payload.proof);
    return this.contract.registerIdentity(payload.identity.commitment, payload.proof.proof);
  }

  async validateProof(proof: SemaphoreProofStruct) {
    return this.contract.validateUniPassProof(proof);
  }

  async verifyProof(proof: SemaphoreProofStruct) {
    return this.contract.verifyUniPassProof(proof);
  }

  async isRegistered(identityCommitment: bigint) {
    return this.contract.isRegistered(identityCommitment);
  }

  async getGroupState() {
    const [groupId, root, members] = await Promise.all([
      this.contract.groupId(),
      this.contract.currentMerkleRoot(),
      this.contract.memberCount()
    ]);

    return {
      groupId: BigInt(groupId),
      root: BigInt(root),
      members: Number(members)
    };
  }
}

