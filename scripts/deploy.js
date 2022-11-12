//imports
const { ethers, run, network } = require("hardhat");
require("dotenv").config();
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying ...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    // wait for few blocks to be mined until the verification process (BEST PRACTICE)
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }
  // where is rpc url and private key?
  // hardhat network doesn't require both
  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value is: ${currentValue}`);

  //update current value
  const transactionResponse = await simpleStorage.store(46);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value:${updatedValue}`);
}
// contract address 0xe6229b886609DC4F77d55dE81ed8d7395906a910
async function verify(contractAddress, args) {
  console.log("verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verifed!");
    } else {
      console.log(e);
    }
  }
}

//main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
