// =============================================================================
// Contract Configuration
// =============================================================================

export const CONTRACTS = {
  // Update these addresses after deployment
  UNIPASS_REGISTRY: process.env.NEXT_PUBLIC_UNIPASS_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  SEMAPHORE: process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// UniPassRegistry ABI (minimal for frontend interactions)
export const UNIPASS_REGISTRY_ABI = [
  {
    inputs: [
      { name: "identityCommitment", type: "uint256" },
      {
        name: "passportProof",
        type: "tuple",
        components: [
          { name: "version", type: "bytes32" },
          {
            name: "proofVerificationData",
            type: "tuple",
            components: [
              { name: "vkeyHash", type: "bytes32" },
              { name: "proof", type: "bytes" },
              { name: "publicInputs", type: "bytes32[]" },
            ],
          },
          { name: "committedInputs", type: "bytes" },
          {
            name: "serviceConfig",
            type: "tuple",
            components: [
              { name: "validityPeriodInSeconds", type: "uint256" },
              { name: "domain", type: "string" },
              { name: "scope", type: "string" },
              { name: "devMode", type: "bool" },
            ],
          },
        ],
      },
      { name: "isIDCard", type: "bool" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "proof",
        type: "tuple",
        components: [
          { name: "merkleTreeDepth", type: "uint256" },
          { name: "merkleTreeRoot", type: "uint256" },
          { name: "nullifier", type: "uint256" },
          { name: "message", type: "uint256" },
          { name: "scope", type: "uint256" },
          { name: "points", type: "uint256[8]" },
        ],
      },
    ],
    name: "verifyAndConsume",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGroupId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniPassGroupId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "nullifiers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "bytes32" }],
    name: "passportIdentifiers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "identityCommitment", type: "uint256" },
      { indexed: true, name: "passportId", type: "bytes32" },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "nullifier", type: "uint256" },
      { indexed: true, name: "scope", type: "uint256" },
    ],
    name: "ProofVerified",
    type: "event",
  },
] as const;

// Semaphore ABI (minimal for reading group data)
export const SEMAPHORE_ABI = [
  {
    inputs: [{ name: "groupId", type: "uint256" }],
    name: "getMerkleTreeRoot",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "groupId", type: "uint256" }],
    name: "getMerkleTreeDepth",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "groupId", type: "uint256" }],
    name: "getMerkleTreeSize",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

