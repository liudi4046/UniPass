import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";
import { Contract, JsonRpcSigner, Interface } from "ethers";

export interface UniPassConfig {
  registryAddress: string;
  signer: JsonRpcSigner;
}

export class UniPassSDK {
  private registryAddress: string;
  private signer: JsonRpcSigner;

  constructor(config: UniPassConfig) {
    this.registryAddress = config.registryAddress;
    this.signer = config.signer;
  }

  async createIdentity(secret?: string): Promise<Identity> {
    return new Identity(secret);
  }

  async register(identity: Identity, passportProof: any) {
    // ABI for register function
    const abi = [
      "function register(uint256 identityCommitment, tuple(uint256 nullifier, uint256 timestamp, bytes proofData) passportProof)"
    ];
    const contract = new Contract(this.registryAddress, abi, this.signer);
    
    const tx = await contract.register(identity.commitment, passportProof);
    return await tx.wait();
  }

  async verifyAndConsume(
    identity: Identity, 
    group: Group, 
    scope: number | string, 
    message: number | string
  ) {
    const proof = await generateProof(identity, group, scope, message);

    const abi = [
        "function verifyAndConsume(tuple(uint256 merkleTreeDepth, uint256 merkleTreeRoot, uint256 nullifier, uint256 message, uint256 scope, uint256[8] points) proof)"
    ];
    const contract = new Contract(this.registryAddress, abi, this.signer);

    const tx = await contract.verifyAndConsume({
        merkleTreeDepth: proof.merkleTreeDepth,
        merkleTreeRoot: proof.merkleTreeRoot,
        nullifier: proof.nullifier,
        message: proof.message,
        scope: proof.scope,
        points: proof.points
    });
    return await tx.wait();
  }
}

