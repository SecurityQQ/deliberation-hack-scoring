const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const CommentPayment = await hre.ethers.getContractFactory("CommentPayment");
  const contract = await CommentPayment.deploy("0x67608C8c5557aD66e2742ed2e8E14125FB83B47e");

  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
