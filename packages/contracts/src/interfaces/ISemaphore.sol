//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

interface ISemaphore {
    struct SemaphoreProof {
        uint256 merkleTreeDepth;
        uint256 merkleTreeRoot;
        uint256 nullifier;
        uint256 message;
        uint256 scope;
        uint256[8] points;
    }

    function createGroup(address admin) external returns (uint256);
    function addMember(uint256 groupId, uint256 identityCommitment) external;
    function verifyProof(uint256 groupId, SemaphoreProof calldata proof) external view returns (bool);
    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external;
}

