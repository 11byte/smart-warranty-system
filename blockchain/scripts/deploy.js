const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("ProductRegistry");
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("✅ Contract deployed at:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
