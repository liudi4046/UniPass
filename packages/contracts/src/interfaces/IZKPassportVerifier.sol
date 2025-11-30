//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

/**
 * @notice The data that can be bound to the proof
 */
struct BoundData {
    // The address of the ID holder
    address senderAddress;
    // The chain id (block.chainid)
    uint256 chainId;
    // The custom data (encoded as ASCII string)
    string customData;
}

/**
 * @notice The data that can be disclosed by the proof
 */
struct DisclosedData {
    // The name of the ID holder (includes the angular brackets from the MRZ)
    string name;
    // The issuing country of the ID
    string issuingCountry;
    // The nationality of the ID holder
    string nationality;
    // The gender of the ID holder
    string gender;
    // The birth date of the ID holder
    string birthDate;
    // The expiry date of the ID
    string expiryDate;
    // The document number of the ID
    string documentNumber;
    // The type of the document
    string documentType;
}

struct ProofVerificationData {
    bytes32 vkeyHash;
    bytes proof;
    bytes32[] publicInputs;
}

struct ServiceConfig {
    uint256 validityPeriodInSeconds;
    string domain;
    string scope;
    bool devMode;
}

struct ProofVerificationParams {
    bytes32 version;
    ProofVerificationData proofVerificationData;
    bytes committedInputs;
    ServiceConfig serviceConfig;
}

// Enum for FaceMatch mode
enum FaceMatchMode {
    Any,
    Strict
}

// Enum for OS
enum OS {
    Any,
    iOS,
    Android
}

/**
 * @notice The public interface for the ZKPassport verifier contract
 */
interface IZKPassportVerifier {
    /**
     * @notice Verifies a proof from ZKPassport
     * @param params The proof verification parameters
     * @return verified True if the proof is valid, false otherwise
     * @return uniqueIdentifier The unique identifier associated to the identity document that generated the proof
     * @return helper The ZKPassportHelper contract that can be used to verify the information or conditions that are checked by the proof
     */
    function verify(ProofVerificationParams calldata params) external returns (bool verified, bytes32 uniqueIdentifier, IZKPassportHelper helper);
}

/**
 * @notice You can use to helper contract verifying the information or conditions that are checked by the proof
 */
interface IZKPassportHelper {
    function verifyScopes(bytes32[] calldata publicInputs, string calldata domain, string calldata scope) external pure returns (bool);
    function getDisclosedData(bytes calldata committedInputs, bool isIDCard) external pure returns (DisclosedData memory);
    function getBoundData(bytes calldata committedInputs) external pure returns (BoundData memory);
    function isAgeAboveOrEqual(uint8 minAge, bytes calldata committedInputs) external pure returns (bool);
    // ... add other helper methods as needed
}
