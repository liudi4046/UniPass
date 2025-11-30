import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof, SemaphoreProof } from "@semaphore-protocol/proof";
import { Contract, JsonRpcSigner } from "ethers";
import { ZKPassport, ProofResult, QueryResult } from "@zkpassport/sdk";

export interface UniPassConfig {
  registryAddress: string;
  signer: JsonRpcSigner;
  domain?: string; // Your app domain, e.g. "unipass.id"
}

export class UniPassSDK {
  private registryAddress: string;
  private signer: JsonRpcSigner;
  private zkPassport: ZKPassport;
  private domain: string;

  constructor(config: UniPassConfig) {
    this.registryAddress = config.registryAddress;
    this.signer = config.signer;
    this.domain = config.domain || "unipass.id";
    this.zkPassport = new ZKPassport(this.domain);
  }

  async createIdentity(secret?: string): Promise<Identity> {
    return new Identity(secret);
  }

  /**
   * Creates a request to verify a passport for registration.
   * Returns the QueryBuilder which can be used to generate the QR code URL.
   */
  async createRegistrationRequest(scope: string = "unipass-registry") {
    const walletAddress = await this.signer.getAddress();
    const chainId = (await this.signer.provider?.getNetwork())?.chainId;

    return this.zkPassport.request({
      name: "UniPass",
      logo: "https://unipass.id/logo.png",
      purpose: "Create your anonymous global identity",
      scope: scope,
      mode: "compressed-evm", // Required for on-chain verification
    })
    .then(qb => 
      qb
        .disclose("nationality")
        .disclose("document_type")
        .bind("user_address", walletAddress)
        .bind("chain", "ethereum") // Assuming Ethereum for now, map chainId if needed
        .done()
    );
  }

  /**
   * Registers the user on-chain using the ZKPassport proof.
   */
  async register(
    identity: Identity, 
    proofResult: ProofResult, 
    scope: string = "unipass-registry",
    isIDCard: boolean = false
  ) {
    const verifierParams = this.zkPassport.getSolidityVerifierParameters({
      proof: proofResult,
      scope: scope,
      devMode: false, // Set to true if testing with mock app
    });

    const abi = [
      "function register(uint256 identityCommitment, tuple(bytes32 version, tuple(bytes32 vkeyHash, bytes proof, bytes32[] publicInputs) proofVerificationData, bytes committedInputs, tuple(uint256 validityPeriodInSeconds, string domain, string scope, bool devMode) serviceConfig) passportProof, bool isIDCard)"
    ];
    const contract = new Contract(this.registryAddress, abi, this.signer);
    
    const tx = await contract.register(identity.commitment, verifierParams, isIDCard);
    return await tx.wait();
  }

  /**
   * Verifies membership in the UniPass group and executes an action (consuming nullifier).
   */
  async verifyAndConsume(
    identity: Identity, 
    group: Group, 
    scope: number | string, 
    message: number | string
  ) {
    // In Semaphore v4, generateProof returns a JSON-like object or struct
    const proof = await generateProof(identity, group, message, scope);

    const abi = [
        "function verifyAndConsume(tuple(uint256 merkleTreeDepth, uint256 merkleTreeRoot, uint256 nullifier, uint256 message, uint256 scope, uint256[8] points) proof)"
    ];
    const contract = new Contract(this.registryAddress, abi, this.signer);

    // Ensure proof matches the struct expectation
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
