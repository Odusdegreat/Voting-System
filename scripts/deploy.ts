import { ethers } from "hardhat";

async function main() {
  const dao_voting_system_factory =
    await ethers.getContractFactory("DAOVotingSystem");
  const dao_voting_system = await dao_voting_system_factory.deploy();

  await dao_voting_system.waitForDeployment();

  const contract_address = await dao_voting_system.getAddress();

  console.log("DAO Voting System deployed to:", contract_address);
  console.log(
    `Set dao-voting-frontend/.env.local -> VITE_DAO_CONTRACT_ADDRESS=${contract_address}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
