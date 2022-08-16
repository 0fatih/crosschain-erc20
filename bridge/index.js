const { ethers } = require("ethers");
require("dotenv").config();

const { ABI } = require("./constants");

const FUJI = new (function () {
  this.provider = new ethers.providers.JsonRpcProvider(
    process.env.FUJI_PROVIDER
  );
  this.contract = new ethers.Contract(
    process.env.FUJI_ADDRESS,
    ABI,
    this.provider
  );
  this.chainId = 43113;
})();

const BSC = new (function () {
  this.provider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_PROVIDER
  );
  this.contract = new ethers.Contract(
    process.env.BSC_ADDRESS,
    ABI,
    this.provider
  );
  this.chainId = 97;
})();

const verifierWallet = new ethers.Wallet(process.env.VERIFIER_PK);

const move = async (sender, amount, networkName) => {
  console.log("[+] new request from", networkName, "network");
  const network = networkName == "fuji" ? FUJI : BSC;
  const otherNetwork = network == FUJI ? BSC : FUJI;

  const nonce = await otherNetwork.contract.nonces(sender);

  const domain = {
    name: "My Awesome Token",
    version: "1",
    verifyingContract: otherNetwork.contract.address,
    chainId: otherNetwork.chainId,
  };

  const types = {
    Request: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const value = {
    to: sender,
    amount: amount,
    nonce: nonce.toString(),
  };

  const signature = await verifierWallet._signTypedData(domain, types, value);

  const callerWallet = new ethers.Wallet(
    process.env.CALLER_PK,
    otherNetwork.provider
  );
  const contractWS = new ethers.Contract(
    otherNetwork.contract.address,
    ABI,
    callerWallet
  );

  const expectedSigner = verifierWallet.address;
  const foundSigner = await contractWS.verify(value, signature);
  if (expectedSigner != foundSigner) {
    console.log("signature failed");
    return;
  }

  console.log("[+] tokens minting...");
  await contractWS.mint(
    { to: sender, amount: amount, nonce: nonce },
    signature
  );

  console.log(
    `[+] From ${networkName} to other chain:  ${sender} - ${ethers.utils.formatEther(
      amount
    )} token moved`
  );
};

FUJI.contract.on("Moved", async (sender, amount) => {
  await move(sender, amount, "fuji");
});

BSC.contract.on("Moved", async (sender, amount) => {
  await move(sender, amount, "bsc");
});

console.log("started to listen...");
