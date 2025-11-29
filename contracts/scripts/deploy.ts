import { ethers } from "hardhat";

async function main() {
  const semaphoreAddress = process.env.SEMAPHORE_ADDRESS;
  const validatorAddress = process.env.PASSPORT_VALIDATOR_ADDRESS;
  const merkleTreeDuration = Number(process.env.MERKLE_TREE_DURATION ?? 86400);

  if (!semaphoreAddress || !validatorAddress) {
    throw new Error("Missing SEMAPHORE_ADDRESS or PASSPORT_VALIDATOR_ADDRESS env vars");
  }

  const registryFactory = await ethers.getContractFactory("UniPassRegistry");
  const registry = await registryFactory.deploy(semaphoreAddress, validatorAddress, merkleTreeDuration);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const groupId = await registry.groupId();

  console.log(`UniPassRegistry deployed to: ${address}`);
  console.log(`Group ID: ${groupId.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

