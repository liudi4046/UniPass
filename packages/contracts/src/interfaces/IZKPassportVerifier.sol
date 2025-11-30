//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

interface IZKPassportVerifier {
    // A simplified struct for passport proof
    struct PassportProof {
        uint256 nullifier; // To prevent reusing the same passport for registration
        uint256 timestamp;
        // In reality this would contain ZK points and public inputs
        bytes proofData; 
    }

    // Returns true if the passport proof is valid
    function verifyPassport(PassportProof calldata proof) external view returns (bool);
}

