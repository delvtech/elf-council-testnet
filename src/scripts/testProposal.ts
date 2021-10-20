import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike } from "ethers";
import hre, { ethers } from "hardhat";
import addressesJson from "src/addresses/addresses.json";
import { getMerkleTree, hashAccount } from "src/merkle";
import {
  CoreVoting__factory,
  LockingVault__factory,
  MockERC20__factory,
} from "types";
import timelockData from "../../artifacts/src/contracts/features/Timelock.sol/Timelock.json";

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const FIFTY_ETHER = ethers.utils.parseEther("50");
async function testProposal() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;
  const {
    addresses: {
      lockingVault,
      optimisticRewardsVault,
      timeLock,
      coreVoting,
      elementToken,
    },
  } = addressesJson;
  60;

  const lockingVaultContract = LockingVault__factory.connect(
    lockingVault,
    signer
  );

  const elementTokenContract = MockERC20__factory.connect(elementToken, signer);
  const setBalTx = await elementTokenContract.setBalance(
    signer.address,
    parseEther("50")
  );
  await setBalTx.wait(1);

  const setAllowanceTx = await elementTokenContract.setAllowance(
    signer.address,
    lockingVault,
    ethers.constants.MaxUint256
  );
  await setAllowanceTx.wait(1);

  const depositTx = await lockingVaultContract.deposit(
    signer.address,
    parseEther("50"),
    signer.address
  );
  await depositTx.wait(1);

  const accounts = [];
  for (const i in signers) {
    accounts.push({
      address: signers[i].address,
      value: FIFTY_ETHER,
    });
  }

  const merkleTree = getMerkleTree(accounts);

  const coreVotingContract = CoreVoting__factory.connect(coreVoting, signer);
  const newWaitTime = 123456;
  const tInterface = new ethers.utils.Interface(timelockData.abi);

  //setup calldata for timelock's setTime function.
  const calldataTimelock = tInterface.encodeFunctionData("setWaitTime", [
    newWaitTime,
  ]);
  // get the callhash
  const callHash = await createCallHash([calldataTimelock], [timeLock]);
  // calldata for the coreVoting contract

  const calldataCoreVoting = tInterface.encodeFunctionData("registerCall", [
    callHash,
  ]);

  const proof = merkleTree.getHexProof(
    await hashAccount({
      address: signers[0].address,
      value: FIFTY_ETHER,
    })
  );
  console.log("proof", proof);
  const extraData = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "bytes32[]"],
    [FIFTY_ETHER, proof]
  );

  const votingVaults = [lockingVault, optimisticRewardsVault];
  const extraVaultData = ["0x00", extraData]; // empty for now
  const targets = [timeLock];
  const ballot = 0; // yes
  const callDatas = [calldataCoreVoting];
  const lastCall = Math.round(Date.now() / 1000) + ONE_WEEK_IN_SECONDS;

  const tx = await coreVotingContract.proposal(
    votingVaults,
    extraVaultData,
    targets,
    callDatas,
    lastCall,
    ballot
  );
  await tx.wait(1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
testProposal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export async function createCallHash(calldata: BytesLike[], targets: string[]) {
  const toBeHashed = ethers.utils.defaultAbiCoder.encode(
    ["address[]", "bytes[]"],
    [targets, calldata]
  );
  return ethers.utils.keccak256(toBeHashed);
}
