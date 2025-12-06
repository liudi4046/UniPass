//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

import {Script, console2} from "forge-std/Script.sol";
import {UniPassRegistry} from "../src/UniPassRegistry.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Load environment variables
        address semaphoreAddress = vm.envAddress("SEMAPHORE_ADDRESS");
        address zkPassportVerifierAddress = vm.envAddress("ZKPASSPORT_VERIFIER_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        require(semaphoreAddress != address(0), "SEMAPHORE_ADDRESS not set");
        require(zkPassportVerifierAddress != address(0), "ZKPASSPORT_VERIFIER_ADDRESS not set");

        console2.log("Deploying UniPassRegistry...");
        console2.log("Semaphore Address:", semaphoreAddress);
        console2.log("ZKPassport Verifier:", zkPassportVerifierAddress);

        vm.startBroadcast(deployerPrivateKey);

        UniPassRegistry registry = new UniPassRegistry(semaphoreAddress, zkPassportVerifierAddress);

        vm.stopBroadcast();

        console2.log("UniPassRegistry deployed at:", address(registry));
        console2.log("UniPass Group ID:", registry.uniPassGroupId());
    }
}

/**
 * @title DeployMockScript
 * @notice Deploys mock contracts for local testing
 */
contract DeployMockScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)); // Default Anvil key

        console2.log("Deploying Mock Contracts for Local Testing...");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock contracts
        MockSemaphore semaphore = new MockSemaphore();
        MockZKPassportVerifier verifier = new MockZKPassportVerifier();

        console2.log("MockSemaphore deployed at:", address(semaphore));
        console2.log("MockZKPassportVerifier deployed at:", address(verifier));

        // Deploy UniPassRegistry with mocks
        UniPassRegistry registry = new UniPassRegistry(address(semaphore), address(verifier));

        vm.stopBroadcast();

        console2.log("UniPassRegistry deployed at:", address(registry));
        console2.log("UniPass Group ID:", registry.uniPassGroupId());
    }
}

// =============================================================================
// Mock Contracts for Local Testing
// =============================================================================

import {ISemaphore} from "../src/interfaces/ISemaphore.sol";
import {IZKPassportVerifier, IZKPassportHelper, ProofVerificationParams, BoundData, DisclosedData} from "../src/interfaces/IZKPassportVerifier.sol";

contract MockSemaphore is ISemaphore {
    uint256 private _nextGroupId = 1;
    mapping(uint256 => address) public groupAdmins;
    mapping(uint256 => mapping(uint256 => bool)) public members;
    mapping(uint256 => uint256) public merkleRoots;

    function createGroup(address admin) external override returns (uint256) {
        uint256 groupId = _nextGroupId++;
        groupAdmins[groupId] = admin;
        merkleRoots[groupId] = 1; // Mock root
        return groupId;
    }

    function addMember(uint256 groupId, uint256 identityCommitment) external override {
        require(groupAdmins[groupId] == msg.sender, "Not admin");
        members[groupId][identityCommitment] = true;
        merkleRoots[groupId] = uint256(keccak256(abi.encode(merkleRoots[groupId], identityCommitment)));
    }

    function verifyProof(uint256 groupId, SemaphoreProof calldata proof) external view override returns (bool) {
        // In mock, just check if merkle root matches and return true
        return proof.merkleTreeRoot == merkleRoots[groupId] || merkleRoots[groupId] != 0;
    }

    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external view override {
        require(this.verifyProof(groupId, proof), "Invalid proof");
    }
}

contract MockZKPassportVerifier is IZKPassportVerifier {
    MockZKPassportHelper private _helper;

    constructor() {
        _helper = new MockZKPassportHelper();
    }

    function verify(
        ProofVerificationParams calldata params
    ) external view override returns (bool verified, bytes32 uniqueIdentifier, IZKPassportHelper helper) {
        // Mock: always return verified with a deterministic unique identifier
        uniqueIdentifier = keccak256(params.committedInputs);
        return (true, uniqueIdentifier, _helper);
    }
}

contract MockZKPassportHelper is IZKPassportHelper {
    function verifyScopes(
        bytes32[] calldata,
        string calldata,
        string calldata
    ) external pure override returns (bool) {
        return true;
    }

    function getDisclosedData(bytes calldata, bool) external pure override returns (DisclosedData memory) {
        return DisclosedData({
            name: "MOCK<<USER",
            issuingCountry: "USA",
            nationality: "USA",
            gender: "M",
            birthDate: "19900101",
            expiryDate: "20301231",
            documentNumber: "123456789",
            documentType: "P"
        });
    }

    function getBoundData(bytes calldata committedInputs) external pure override returns (BoundData memory) {
        // Decode sender and chainId from committedInputs
        // In mock, we'll just use defaults or decode if possible
        if (committedInputs.length >= 52) {
            address sender = address(bytes20(committedInputs[0:20]));
            uint256 chainId = uint256(bytes32(committedInputs[20:52]));
            return BoundData({senderAddress: sender, chainId: chainId, customData: ""});
        }
        return BoundData({senderAddress: address(0), chainId: 1, customData: ""});
    }

    function isAgeAboveOrEqual(uint8, bytes calldata) external pure override returns (bool) {
        return true;
    }
}



