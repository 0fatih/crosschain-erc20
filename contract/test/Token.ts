import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token } from "../typechain-types/contracts/Token";
import MintRequest = Token.MintRequestStruct;

const ether = (number: string) => {
  return ethers.utils.parseEther(number);
};

describe("Token", function () {
  async function deployFixture() {
    const [owner, otherAccount, verifier] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(verifier.address);

    return { token, verifier, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Check constants", async function () {
      const { token, verifier } = await loadFixture(deployFixture);

      expect(await token.VERIFIER()).to.equal(verifier.address);
    });
  });

  describe("Check signature verification", function () {
    it("Should return the signer", async function () {
      const { token, verifier, owner } = await loadFixture(deployFixture);

      const domain = {
        name: "My Awesome Token",
        version: "1",
        verifyingContract: token.address,
        chainId: 31337,
      };

      const types = {
        Request: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const value: MintRequest = {
        to: owner.address,
        amount: ether("1"),
        nonce: 0,
      };

      const signature = await verifier._signTypedData(domain, types, value);

      expect(await token.verify(value, signature)).to.equal(verifier.address);
    });
  });

  describe("Mint", function () {
    it("Try to mint with wrong signature", async function () {
      const { token, owner } = await loadFixture(deployFixture);

      const domain = {
        name: "My Awesome Token",
        version: "1",
        verifyingContract: token.address,
        chainId: 31337,
      };

      const types = {
        Request: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const value: MintRequest = {
        to: owner.address,
        amount: ether("1"),
        nonce: 0,
      };

      const signature = await owner._signTypedData(domain, types, value);

      await expect(token.mint(value, signature)).to.be.revertedWithCustomError(
        token,
        "WrongSigner"
      );
    });

    it("Mint with verifier", async function () {
      const { token, verifier, owner } = await loadFixture(deployFixture);

      const domain = {
        name: "My Awesome Token",
        version: "1",
        verifyingContract: token.address,
        chainId: 31337,
      };

      const types = {
        Request: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const value: MintRequest = {
        to: owner.address,
        amount: ether("1"),
        nonce: 0,
      };

      const signature = await verifier._signTypedData(domain, types, value);

      const balance = await token.balanceOf(owner.address);
      await token.mint(value, signature);

      expect(await token.balanceOf(owner.address)).to.equal(
        balance.add(ether("1"))
      );
    });
  });

  describe("Burn", function () {
    it("Burn tokens", async function () {
      const { token, owner } = await loadFixture(deployFixture);

      const balance = await token.balanceOf(owner.address);
      await token.moveToOtherChain(ether("11"));
      expect(await token.balanceOf(owner.address)).to.equal(
        balance.sub(ether("11"))
      );
    });
  });
});
