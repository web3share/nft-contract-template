// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';


/**
 *  deploy docs
 *  https://hardhat.org/guides/deploying.html
 */

async function main(): Promise<void> {
  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");
  await deployNFT()
}

async function deployNFT(): Promise<void> {
  const PublicMintNFTFactory: ContractFactory = await ethers.getContractFactory(
    'PublicMintNFTTemplate',
  );
  const publicMintNFT: Contract = await PublicMintNFTFactory.deploy("","Punk","Punk",1000);
  await publicMintNFT.deployed();
  console.log(`publicMintNFT contract deployed: ${publicMintNFT.address},tx: ${publicMintNFT.deployTransaction.hash}`);
  await publicMintNFT.togglePublicSaleStarted();
  await publicMintNFT.setPricePerNFT(1000000000000000);
  console.log(`init contract success`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
