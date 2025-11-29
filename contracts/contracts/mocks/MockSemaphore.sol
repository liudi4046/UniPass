// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {ISemaphoreGroups} from "@semaphore-protocol/contracts/interfaces/ISemaphoreGroups.sol";

/// @dev 简化版的 Semaphore，实现了 UniPassRegistry 测试所需的最小功能。
contract MockSemaphore {
    error Semaphore__GroupDoesNotExist();
    error Semaphore__CallerIsNotTheGroupAdmin();
    error Semaphore__GroupHasNoMembers();
    error Semaphore__YouAreUsingTheSameNullifierTwice();

    struct GroupConfig {
        address admin;
        uint256 duration;
        uint256 root;
        uint256 size;
        mapping(uint256 => bool) members;
        mapping(uint256 => bool) nullifiers;
    }

    uint256 public groupCounter;
    mapping(uint256 => GroupConfig) private groups;

    event ProofValidated(
        uint256 indexed groupId,
        uint256 merkleTreeDepth,
        uint256 indexed merkleTreeRoot,
        uint256 nullifier,
        uint256 message,
        uint256 indexed scope,
        uint256[8] points
    );

    /*//////////////////////////////////////////////////////////////
                               GROUP MGMT
    //////////////////////////////////////////////////////////////*/

    function createGroup() external returns (uint256) {
        return _createGroup(msg.sender, 1 hours);
    }

    function createGroup(address admin) external returns (uint256) {
        return _createGroup(admin, 1 hours);
    }

    function createGroup(address admin, uint256 duration) external returns (uint256) {
        return _createGroup(admin, duration);
    }

    function _createGroup(address admin, uint256 duration) internal returns (uint256 groupId) {
        groupId = groupCounter++;
        groups[groupId].admin = admin;
        groups[groupId].duration = duration;
    }

    function getGroupAdmin(uint256 groupId) external view returns (address) {
        _ensureGroupExists(groupId);
        return groups[groupId].admin;
    }

    function updateGroupAdmin(uint256 groupId, address newAdmin) external {
        _onlyAdmin(groupId);
        groups[groupId].admin = newAdmin;
    }

    function acceptGroupAdmin(uint256) external pure {
        revert("NOT_IMPLEMENTED");
    }

    function updateGroupMerkleTreeDuration(uint256 groupId, uint256 newDuration) external {
        _onlyAdmin(groupId);
        groups[groupId].duration = newDuration;
    }

    function addMember(uint256 groupId, uint256 identityCommitment) public {
        _onlyAdmin(groupId);

        if (groups[groupId].members[identityCommitment]) {
            revert("MEMBER_EXISTS");
        }

        groups[groupId].members[identityCommitment] = true;
        groups[groupId].size += 1;
        groups[groupId].root = uint256(keccak256(abi.encode(groups[groupId].root, identityCommitment)));
    }

    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external {
        for (uint256 i = 0; i < identityCommitments.length; i++) {
            addMember(groupId, identityCommitments[i]);
        }
    }

    function updateMember(
        uint256,
        uint256,
        uint256,
        uint256[] calldata
    ) external pure {
        revert("NOT_IMPLEMENTED");
    }

    function removeMember(
        uint256,
        uint256,
        uint256[] calldata
    ) external pure {
        revert("NOT_IMPLEMENTED");
    }

    /*//////////////////////////////////////////////////////////////
                                 PROOFS
    //////////////////////////////////////////////////////////////*/

    function validateProof(uint256 groupId, ISemaphore.SemaphoreProof calldata proof) external {
        _ensureGroupHasMembers(groupId);

        if (groups[groupId].nullifiers[proof.nullifier]) {
            revert Semaphore__YouAreUsingTheSameNullifierTwice();
        }

        groups[groupId].nullifiers[proof.nullifier] = true;

        emit ProofValidated(
            groupId,
            proof.merkleTreeDepth,
            proof.merkleTreeRoot,
            proof.nullifier,
            proof.message,
            proof.scope,
            proof.points
        );
    }

    function verifyProof(
        uint256 groupId,
        ISemaphore.SemaphoreProof calldata proof
    ) external view returns (bool) {
        _ensureGroupHasMembers(groupId);
        return proof.merkleTreeRoot == groups[groupId].root;
    }

    /*//////////////////////////////////////////////////////////////
                                   VIEWS
    //////////////////////////////////////////////////////////////*/

    function hasMember(uint256 groupId, uint256 identityCommitment) external view returns (bool) {
        _ensureGroupExists(groupId);
        return groups[groupId].members[identityCommitment];
    }

    function indexOf(uint256, uint256) external pure returns (uint256) {
        revert("NOT_IMPLEMENTED");
    }

    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256) {
        _ensureGroupExists(groupId);
        return groups[groupId].root;
    }

    function getMerkleTreeDepth(uint256) external pure returns (uint256) {
        return 20;
    }

    function getMerkleTreeSize(uint256 groupId) external view returns (uint256) {
        _ensureGroupExists(groupId);
        return groups[groupId].size;
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    function _onlyAdmin(uint256 groupId) internal view {
        _ensureGroupExists(groupId);

        if (groups[groupId].admin != msg.sender) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
    }

    function _ensureGroupExists(uint256 groupId) internal view {
        if (groups[groupId].admin == address(0) && groupId >= groupCounter) {
            revert Semaphore__GroupDoesNotExist();
        }
    }

    function _ensureGroupHasMembers(uint256 groupId) internal view {
        if (groups[groupId].size == 0) {
            revert Semaphore__GroupHasNoMembers();
        }
    }
}

