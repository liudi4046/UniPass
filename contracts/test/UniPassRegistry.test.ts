import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
type SemaphoreProof = {
  merkleTreeDepth: bigint;
  merkleTreeRoot: bigint;
  nullifier: bigint;
  message: bigint;
  scope: bigint;
  points: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

describe("UniPassRegistry", function () {
  async function deployFixture() {
    const [deployer, alice, bob] = await ethers.getSigners();

    const semaphoreFactory = await ethers.getContractFactory("MockSemaphore");
    const semaphore = await semaphoreFactory.deploy();
    await semaphore.waitForDeployment();

    const mockValidatorFactory = await ethers.getContractFactory("MockPassportValidator");
    const mockValidator = await mockValidatorFactory.deploy(true);
    await mockValidator.waitForDeployment();

    const registryFactory = await ethers.getContractFactory("UniPassRegistry");
    const registry = await registryFactory.deploy(
      await semaphore.getAddress(),
      await mockValidator.getAddress(),
      3600
    );
    await registry.waitForDeployment();

    const groupId = await registry.groupId();

    return {
      deployer,
      alice,
      bob,
      semaphore,
      mockValidator,
      registry,
      groupId
    };
  }

  describe("constructor", function () {
    it("creates a semaphore group owned by registry", async function () {
      const { registry, groupId, semaphore } = await loadFixture(deployFixture);
      expect(groupId).to.be.a("bigint");

      const admin = await semaphore.getGroupAdmin(groupId);
      expect(admin).to.equal(await registry.getAddress());
    });
  });

  describe("registerIdentity", function () {
    it("registers identity when validator approves", async function () {
      const { registry, alice } = await loadFixture(deployFixture);
      const commitment = 123456789n;

      await expect(registry.connect(alice).registerIdentity(commitment, "0x01"))
        .to.emit(registry, "IdentityRegistered")
        .withArgs(commitment, anyValue, alice.address);

      expect(await registry.memberCount()).to.equal(1n);
      expect(await registry.isRegistered(commitment)).to.equal(true);
    });

    it("reverts if validator rejects proof", async function () {
      const { registry, mockValidator, alice } = await loadFixture(deployFixture);
      await mockValidator.setValidationResult(false);

      await expect(registry.connect(alice).registerIdentity(1n, "0x01")).to.be.revertedWithCustomError(
        registry,
        "UniPass__InvalidPassportProof"
      );
    });

    it("reverts on duplicate registration", async function () {
      const { registry, alice } = await loadFixture(deployFixture);
      const commitment = 999n;

      await registry.connect(alice).registerIdentity(commitment, "0x1234");

      await expect(registry.connect(alice).registerIdentity(commitment, "0x1234")).to.be.revertedWithCustomError(
        registry,
        "UniPass__IdentityAlreadyRegistered"
      );
    });
  });

  describe("admin actions", function () {
    it("allows owner to rotate passport validator", async function () {
      const { registry, deployer } = await loadFixture(deployFixture);

      const anotherValidatorFactory = await ethers.getContractFactory("MockPassportValidator");
      const anotherValidator = await anotherValidatorFactory.deploy(true);
      await anotherValidator.waitForDeployment();

      const previousValidator = await registry.passportValidatorAddress();
      const nextValidator = await anotherValidator.getAddress();

      await expect(registry.connect(deployer).updatePassportValidator(nextValidator))
        .to.emit(registry, "PassportValidatorUpdated")
        .withArgs(previousValidator, nextValidator);

      expect(await registry.passportValidatorAddress()).to.equal(nextValidator);
    });

    it("prevents non-owner from rotating validator", async function () {
      const { registry, alice } = await loadFixture(deployFixture);

      await expect(registry.connect(alice).updatePassportValidator(alice.address)).to.be.revertedWithCustomError(
        registry,
        "OwnableUnauthorizedAccount"
      );
    });

    it("allows owner to update merkle tree duration", async function () {
      const { registry, deployer } = await loadFixture(deployFixture);

      await expect(registry.connect(deployer).updateMerkleTreeDuration(7200)).to.not.be.reverted;
    });
  });

  describe("proof helpers", function () {
    it("bubbles up semaphore errors when validating", async function () {
      const { registry, semaphore } = await loadFixture(deployFixture);
      const emptyProof: SemaphoreProof = {
        merkleTreeDepth: 20n,
        merkleTreeRoot: 0n,
        nullifier: 0n,
        message: 0n,
        scope: 0n,
        points: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]
      };

      await expect(registry.validateUniPassProof(emptyProof)).to.be.revertedWithCustomError(
        semaphore,
        "Semaphore__GroupHasNoMembers"
      );
    });
  });
});

