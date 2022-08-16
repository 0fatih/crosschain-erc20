const { ethers } = require("ethers");
require("dotenv").config();

const { ABI } = require("../constants");

async function fromFujiToBSC() {
  const fujiProvider = new ethers.providers.JsonRpcProvider(
    process.env.FUJI_PROVIDER
  );

  const wallet = new ethers.Wallet(process.env.CALLER_PK, fujiProvider);

  const fujiContract = new ethers.Contract(
    process.env.FUJI_ADDRESS,
    ABI,
    wallet
  );

  const tx = await fujiContract.moveToOtherChain(ethers.utils.parseEther("1"));
  console.log("tx sent: ", tx);
  await tx.wait();
}

async function fromBSCToFuji() {
  const BSCProvider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_PROVIDER
  );

  const wallet = new ethers.Wallet(process.env.CALLER_PK, BSCProvider);

  const BSCContract = new ethers.Contract(process.env.BSC_ADDRESS, ABI, wallet);

  const tx = await BSCContract.moveToOtherChain(ethers.utils.parseEther("1"));
  console.log("tx sent: ", tx);
  await tx.wait();
}

if (process.argv[2] == "--from") {
  if (process.argv[3] == "fuji") fromFujiToBSC();
  else if (process.argv[3] == "bsc") fromBSCToFuji();
}
