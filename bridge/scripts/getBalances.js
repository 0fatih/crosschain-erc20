const { ethers } = require("ethers");
require("dotenv").config();

const { ABI } = require("../constants");

async function getBalances() {
  const userAddress = "YOUR_ADDRESS";

  const fujiProvider = new ethers.providers.JsonRpcProvider(
    process.env.FUJI_PROVIDER
  );

  const fujiContract = new ethers.Contract(
    process.env.FUJI_ADDRESS,
    ABI,
    fujiProvider
  );

  const BSCProvider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_PROVIDER
  );
  const BSCContract = new ethers.Contract(
    process.env.BSC_ADDRESS,
    ABI,
    BSCProvider
  );

  console.log(
    "Fuji:",
    ethers.utils.formatEther(await fujiContract.balanceOf(userAddress))
  );
  console.log(
    "BSC:",
    ethers.utils.formatEther(await BSCContract.balanceOf(userAddress))
  );
}

getBalances();
