//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

import {Test, console2} from "forge-std/Test.sol";
import {UniPassRegistry} from "../src/UniPassRegistry.sol";
import {ISemaphore} from "../src/interfaces/ISemaphore.sol";
import {
    IZKPassportVerifier,
    IZKPassportHelper,
    ProofVerificationParams,
    ProofVerificationData,
    ServiceConfig,
    BoundData,
    DisclosedData
} from "../src/interfaces/IZKPassportVerifier.sol";

// =============================================================================
// Mock Contracts
// =============================================================================

contract MockSemaphore is ISemaphore {
    uint256 private _nextGroupId = 1;
    mapping(uint256 => address) public groupAdmins;
    mapping(uint256 => mapping(uint256 => bool)) public members;
    mapping(uint256 => uint256) public merkleRoots;
    mapping(uint256 => uint256[]) public memberList;
    // Track nullifiers per group (like real Semaphore)
    mapping(uint256 => mapping(uint256 => bool)) public nullifiers;

    function createGroup(address admin) external override returns (uint256) {
        uint256 groupId = _nextGroupId++;
        groupAdmins[groupId] = admin;
        merkleRoots[groupId] = 1;
        return groupId;
    }

    function addMember(uint256 groupId, uint256 identityCommitment) external override {
        require(groupAdmins[groupId] == msg.sender, "Not admin");
        members[groupId][identityCommitment] = true;
        memberList[groupId].push(identityCommitment);
        merkleRoots[groupId] = uint256(keccak256(abi.encode(merkleRoots[groupId], identityCommitment)));
    }

    function verifyProof(uint256 groupId, SemaphoreProof calldata proof) external view override returns (bool) {
        return merkleRoots[groupId] != 0 && proof.merkleTreeRoot != 0;
    }

    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external override {
        require(this.verifyProof(groupId, proof), "Invalid proof");
        require(!nullifiers[groupId][proof.nullifier], "Nullifier already used");
        nullifiers[groupId][proof.nullifier] = true;
    }

    // Helper for tests
    function isMember(uint256 groupId, uint256 commitment) external view returns (bool) {
        return members[groupId][commitment];
    }

    function getMerkleRoot(uint256 groupId) external view returns (uint256) {
        return merkleRoots[groupId];
    }

    function isNullifierUsed(uint256 groupId, uint256 nullifier) external view returns (bool) {
        return nullifiers[groupId][nullifier];
    }
}

contract MockZKPassportHelper is IZKPassportHelper {
    function verifyScopes(bytes32[] calldata, string calldata, string calldata) external pure override returns (bool) {
        return true;
    }

    function getDisclosedData(bytes calldata, bool) external pure override returns (DisclosedData memory) {
        return DisclosedData({
            name: "TEST<<USER",
            issuingCountry: "USA",
            nationality: "USA",
            gender: "M",
            birthDate: "19900101",
            expiryDate: "20301231",
            documentNumber: "123456789",
            documentType: "P"
        });
    }

    // Decode bound data from committedInputs (address, uint256 encoded)
    function getBoundData(bytes calldata committedInputs) external pure override returns (BoundData memory) {
        if (committedInputs.length >= 64) {
            (address sender, uint256 chainId) = abi.decode(committedInputs, (address, uint256));
            return BoundData({senderAddress: sender, chainId: chainId, customData: ""});
        }
        return BoundData({senderAddress: address(0), chainId: 0, customData: ""});
    }

    function isAgeAboveOrEqual(uint8, bytes calldata) external pure override returns (bool) {
        return true;
    }
}

contract MockZKPassportVerifier is IZKPassportVerifier {
    MockZKPassportHelper public helper;
    bool public shouldVerify = true;
    bytes32 public returnedIdentifier;

    constructor() {
        helper = new MockZKPassportHelper();
    }

    function setShouldVerify(bool _shouldVerify) external {
        shouldVerify = _shouldVerify;
    }

    function setReturnedIdentifier(bytes32 _identifier) external {
        returnedIdentifier = _identifier;
    }

    function verify(
        ProofVerificationParams calldata params
    ) external view override returns (bool verified, bytes32 uniqueIdentifier, IZKPassportHelper helperContract) {
        uniqueIdentifier = returnedIdentifier != bytes32(0) ? returnedIdentifier : keccak256(params.committedInputs);
        return (shouldVerify, uniqueIdentifier, helper);
    }
}

// =============================================================================
// Test Contract
// =============================================================================

contract UniPassRegistryTest is Test {
    UniPassRegistry public registry;
    MockSemaphore public semaphore;
    MockZKPassportVerifier public verifier;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    uint256 public constant ALICE_COMMITMENT = 12345678901234567890;
    uint256 public constant BOB_COMMITMENT = 98765432109876543210;

    function setUp() public {
        semaphore = new MockSemaphore();
        verifier = new MockZKPassportVerifier();
        registry = new UniPassRegistry(address(semaphore), address(verifier));
    }

    // =========================================================================
    // Constructor Tests
    // =========================================================================

    function test_constructor_setsCorrectAddresses() public view {
        assertEq(address(registry.semaphore()), address(semaphore));
        assertEq(address(registry.zkPassportVerifier()), address(verifier));
    }

    function test_constructor_createsGroup() public view {
        assertEq(registry.uniPassGroupId(), 1);
    }

    function test_constants() public view {
        assertEq(registry.ZK_APP_DOMAIN(), "unipass.id");
        assertEq(registry.ZK_APP_SCOPE(), "unipass-registry");
    }

    // =========================================================================
    // Registration Tests
    // =========================================================================

    function test_register_success() public {
        verifier.setReturnedIdentifier(keccak256("passport1"));
        ProofVerificationParams memory params = _createMockProofParams(alice, block.chainid);

        vm.prank(alice);
        registry.register(ALICE_COMMITMENT, params, false);

        assertTrue(semaphore.isMember(registry.uniPassGroupId(), ALICE_COMMITMENT));
        assertTrue(registry.passportIdentifiers(keccak256("passport1")));
    }

    function test_register_emitsEvent() public {
        bytes32 passportId = keccak256("passport1");
        verifier.setReturnedIdentifier(passportId);
        ProofVerificationParams memory params = _createMockProofParams(alice, block.chainid);

        vm.expectEmit(true, true, false, false);
        emit UniPassRegistry.UserRegistered(ALICE_COMMITMENT, passportId);

        vm.prank(alice);
        registry.register(ALICE_COMMITMENT, params, false);
    }

    function test_register_revert_invalidProof() public {
        verifier.setShouldVerify(false);
        ProofVerificationParams memory params = _createMockProofParams(alice, block.chainid);

        vm.prank(alice);
        vm.expectRevert("Invalid Passport Proof");
        registry.register(ALICE_COMMITMENT, params, false);
    }

    function test_register_revert_wrongSender() public {
        verifier.setReturnedIdentifier(keccak256("passport1"));
        // Create params bound to bob, but alice calls
        ProofVerificationParams memory params = _createMockProofParams(bob, block.chainid);

        vm.prank(alice);
        vm.expectRevert("Proof bound to different address");
        registry.register(ALICE_COMMITMENT, params, false);
    }

    function test_register_revert_wrongChainId() public {
        verifier.setReturnedIdentifier(keccak256("passport1"));
        // Create params with wrong chain ID
        ProofVerificationParams memory params = _createMockProofParams(alice, 999);

        vm.prank(alice);
        vm.expectRevert("Proof bound to different chain");
        registry.register(ALICE_COMMITMENT, params, false);
    }

    function test_register_revert_duplicatePassport() public {
        bytes32 passportId = keccak256("passport1");
        verifier.setReturnedIdentifier(passportId);

        // First registration
        ProofVerificationParams memory params1 = _createMockProofParams(alice, block.chainid);
        vm.prank(alice);
        registry.register(ALICE_COMMITMENT, params1, false);

        // Try to register again with same passport (same passportId)
        ProofVerificationParams memory params2 = _createMockProofParams(bob, block.chainid);
        vm.prank(bob);
        vm.expectRevert("Passport already registered");
        registry.register(BOB_COMMITMENT, params2, false);
    }

    // =========================================================================
    // Verification Tests
    // =========================================================================

    function test_verifyAndConsume_success() public {
        _registerUser(alice, ALICE_COMMITMENT, keccak256("passport1"));

        ISemaphore.SemaphoreProof memory proof = _createMockSemaphoreProof(12345, 1);
        registry.verifyAndConsume(proof);

        // Nullifier is now tracked by Semaphore, not UniPassRegistry
        assertTrue(semaphore.isNullifierUsed(registry.uniPassGroupId(), proof.nullifier));
    }

    function test_verifyAndConsume_emitsEvent() public {
        _registerUser(alice, ALICE_COMMITMENT, keccak256("passport1"));

        ISemaphore.SemaphoreProof memory proof = _createMockSemaphoreProof(12345, 1);
        
        vm.expectEmit(true, true, false, false);
        emit UniPassRegistry.ProofVerified(proof.nullifier, proof.scope);

        registry.verifyAndConsume(proof);
    }

    function test_verifyAndConsume_revert_nullifierAlreadyUsed() public {
        _registerUser(alice, ALICE_COMMITMENT, keccak256("passport1"));

        ISemaphore.SemaphoreProof memory proof = _createMockSemaphoreProof(12345, 1);

        // First verification
        registry.verifyAndConsume(proof);

        // Try to verify again with same nullifier
        vm.expectRevert("Nullifier already used");
        registry.verifyAndConsume(proof);
    }

    function test_verifyAndConsume_differentScopes() public {
        _registerUser(alice, ALICE_COMMITMENT, keccak256("passport1"));

        // Same user can verify in different scopes (different nullifiers)
        ISemaphore.SemaphoreProof memory proof1 = _createMockSemaphoreProof(11111, 1);
        ISemaphore.SemaphoreProof memory proof2 = _createMockSemaphoreProof(22222, 2);

        registry.verifyAndConsume(proof1);
        registry.verifyAndConsume(proof2);

        // Nullifiers are tracked by Semaphore
        uint256 groupId = registry.uniPassGroupId();
        assertTrue(semaphore.isNullifierUsed(groupId, proof1.nullifier));
        assertTrue(semaphore.isNullifierUsed(groupId, proof2.nullifier));
    }

    // =========================================================================
    // View Function Tests
    // =========================================================================

    function test_getGroupId() public view {
        assertEq(registry.getGroupId(), registry.uniPassGroupId());
    }

    // =========================================================================
    // Helper Functions
    // =========================================================================

    function _createMockProofParams(address sender, uint256 chainId) internal pure returns (ProofVerificationParams memory) {
        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = bytes32(0);

        // Encode sender and chainId into committedInputs for the mock helper to decode
        bytes memory committedInputs = abi.encode(sender, chainId);

        return ProofVerificationParams({
            version: bytes32("v1"),
            proofVerificationData: ProofVerificationData({vkeyHash: bytes32(0), proof: "", publicInputs: publicInputs}),
            committedInputs: committedInputs,
            serviceConfig: ServiceConfig({
                validityPeriodInSeconds: 3600,
                domain: "unipass.id",
                scope: "unipass-registry",
                devMode: false
            })
        });
    }

    function _createMockSemaphoreProof(
        uint256 nullifier,
        uint256 scope
    ) internal view returns (ISemaphore.SemaphoreProof memory) {
        uint256[8] memory points;
        return ISemaphore.SemaphoreProof({
            merkleTreeDepth: 20,
            merkleTreeRoot: semaphore.getMerkleRoot(registry.uniPassGroupId()),
            nullifier: nullifier,
            message: uint256(uint160(alice)),
            scope: scope,
            points: points
        });
    }

    function _registerUser(address user, uint256 commitment, bytes32 passportId) internal {
        verifier.setReturnedIdentifier(passportId);
        ProofVerificationParams memory params = _createMockProofParams(user, block.chainid);

        vm.prank(user);
        registry.register(commitment, params, false);
    }
}
