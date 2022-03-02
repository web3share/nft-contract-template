import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { PublicMintNFTTemplate__factory, PublicMintNFTTemplate } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("PublicMintNFT", () => {
  let airdropNFTAddress: string;
  let airdropInstance: PublicMintNFTTemplate;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const airdropNFTFactory = new PublicMintNFTTemplate__factory(deployer);
    airdropInstance = await airdropNFTFactory.deploy("url", "NFT-Name", "NFT-Symbol", 5);
    console.log(`airdropNFTAddress:${airdropInstance.address}`);
  });

  describe("Raffle", async () => {
    it("ok", async () => {
      const [deployer, user] = await ethers.getSigners();
      // const airdropInstance = new AirdropNFTTemplate__factory(deployer).attach(airdropNFTAddress);
      const totalSupply = await airdropInstance.totalSupply();
      console.log(`totalSupply:${totalSupply}`);
      await airdropInstance.batchMint(
        ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
        [1, 2],
      );
      const totalSupply2 = await airdropInstance.totalSupply();
      console.log(`totalSupply2:${totalSupply2}`);
      await airdropInstance.batchMint(
        ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
        [3, 4],
      );
      await airdropInstance.batchMint(["0xc2132D05D31c914a87C6611C10748AEb04B58e8F"], [5]);

      await airdropInstance.toggleRaffleStarted();

      await airdropInstance.raffle();
    });

    it("revert due to 24 hours raffle interval restriction", async () => {
      const [deployer, user1, user2, user3] = await ethers.getSigners();
      // const airdropInstance = new PublicMintNFTTemplate__factory(deployer).attach(airdropNFTAddress);
      const totalSupply = await airdropInstance.totalSupply();
      console.log(`totalSupply:${totalSupply}`);
      await airdropInstance.batchMint(["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", deployer.address], [1, 2]);
      const totalSupply2 = await airdropInstance.totalSupply();
      await airdropInstance.batchMint([user1.address, user2.address], [3, 4]);
      await airdropInstance.batchMint([user3.address], [5]);
      console.log(`totalSupply2:${totalSupply2}`);
      await airdropInstance.toggleRaffleStarted();
      await airdropInstance.connect(deployer).raffle();
      await expect(airdropInstance.connect(user1).raffle()).to.be.revertedWith(
        "raffle interval must not less than 24 hours",
      );
    });
  });

  describe("Mint", async () => {
    it("ok", async () => {
      const [deployer, user] = await ethers.getSigners();
      await airdropInstance.togglePublicSaleStarted();
      await airdropInstance.setPricePerNFT('2000000000000000000');
      await airdropInstance.connect(user).mint(2, {
        value: ethers.utils.parseEther("4"),
      });
      const totalSupply = await airdropInstance.totalSupply();
      console.log(`total supply ${totalSupply}`);
    });
  });
});
