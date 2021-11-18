import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Account, getMerkleTree } from "src/merkle";
import { deployAirdrop } from "src/scripts/deployAirdrop";
import { deployCoreVoting } from "src/scripts/deployCoreVoting";
import { deployGSCVault } from "src/scripts/deployGSCVault";
import { deployLockingVault } from "src/scripts/deployLockingVault";
import { deployOptimisticRewards } from "src/scripts/deployOptimisticRewards";
import { deployTimelock } from "src/scripts/deployTimelock";
import { deployVestingVault } from "src/scripts/deployVestingVault";
import { deployVotingToken } from "src/scripts/deployVotingToken";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { MerkleRewards } from "types/MerkleRewards";
import { MockERC20 } from "types/MockERC20";
import { OptimisticRewards } from "types/OptimisticRewards";

const FIFTY_VOTING_TOKENS = parseEther("50");

export interface GovernanceContracts {
  elementToken: string;
  coreVoting: string;
  gscCoreVoting: string;
  gscVault: string;
  timeLock: string;
  lockingVault: string;
  vestingVault: string;
  optimisticRewardsVault: string;
  airdropContract: string;
}

export async function deployGovernanace(
  hre: HardhatRuntimeEnvironment,
  signer: SignerWithAddress,
  signers: SignerWithAddress[]
): Promise<GovernanceContracts> {
  console.log(
    "signers",
    signers.map((s) => s.address)
  );
  const votingToken = await deployVotingToken(hre, signer);
  console.log("deployed voting token");

  // deploy core voting contract, we'll have to fill in address values later
  const coreVoting = await deployCoreVoting(
    hre,
    signer,
    [],
    signer.address,
    // set quorum to 50 so any test account can pass a vote
    50,
    // set minProposalPower to 50 so any test account can pass a vote
    50,
    // don't care about the gsc vault yet, that will get set after we deploy the gsc vault
    ethers.constants.AddressZero,
    // can execute a proposal 10 blocks after it gets created
    "10",
    // can vote on a proposal up to 15 blocks from when it gets created
    "15"
  );
  console.log("deployed empty core voting");

  // deploy the core voting vault controlled by the GSC Vault
  const gscCoreVoting = await deployCoreVoting(
    hre,
    signer,
    [],
    // QUESTION: setting the signer here to the timelock owner here so I can use 'authorize' later.
    // is this right?
    signer.address,
    // what values should I be setting these to in order to test GSC powers in developmet?
    // for now, set to 1 so that GSC can pass things easily in development
    "1",
    "1",
    ethers.constants.AddressZero
  );
  console.log("deployed empty gsc core voting");

  const timeLock = await deployTimelock(
    hre,
    signer,
    // can execute a proposal 10 blocks after it gets created
    "10",
    signer.address,
    signer.address
  );
  console.log("deployed timelock");

  const gscVault = await deployGSCVault(
    hre,
    signer,
    gscCoreVoting.address,
    // any test account can get onto GSC with this much vote power
    "100",
    timeLock.address
  );
  console.log("deployed gsc vault");

  // deploy locking vault behind a proxy so it's upgradeable
  const lockingVault = await deployLockingVault(
    hre,
    signer,
    votingToken.address,
    timeLock.address,
    1
  );

  // deploy vesting vault
  const vestingVault = await deployVestingVault(
    hre,
    signer,
    votingToken.address,
    timeLock.address,
    1
  );

  // give out some grants to signers[2] and signers[3]

  const accounts: Account[] = [];
  for (const i in signers) {
    accounts.push({
      address: signers[i].address,
      value: FIFTY_VOTING_TOKENS,
    });
  }

  const merkleTree = getMerkleTree(accounts);
  const optimisticRewardsVault = await deployOptimisticRewards(
    hre,
    signer,
    votingToken.address,
    coreVoting.address,
    merkleTree,
    lockingVault.address
  );
  console.log("deployed rewards vault");

  const airdropContract = await deployAirdrop(
    hre,
    signer,
    votingToken.address,
    coreVoting.address,
    merkleTree,
    lockingVault.address
  );
  console.log("deployed airdrop contract");

  await giveRewardsVaultTokens(accounts, votingToken, signer, airdropContract);
  console.log("airdrop contract seeded with element tokens ");

  // add approved governance vaults. signer is still the owner so we can set these
  await coreVoting.changeVaultStatus(lockingVault.address, true);
  await coreVoting.changeVaultStatus(optimisticRewardsVault.address, true);
  console.log("added vaults to core voting");

  // finalize permissions for coreVoting contract, gscCoreVoting is authorized to make proposoals
  // without needing minimum proposal power, setting the owner to timelock so that it can execute
  // proposals.
  await coreVoting.authorize(gscCoreVoting.address);
  await coreVoting.setOwner(timeLock.address);
  console.log("set permissions for core voting");

  // finalize permissions for timeLock contract, coreVoting is the owner so that it can post proposals
  // to the timelock.  gsc is authorized for some reason.  remove the address that deployed this contract.
  await timeLock.deauthorize(signer.address);
  await timeLock.authorize(gscCoreVoting.address);
  await timeLock.setOwner(coreVoting.address);
  console.log("set permissions for time lock contract");

  // finalize permissions for gscCoreVoting contract, gscVault authorized to make proposals without
  // vote.  timelock set as owner so it can execute proposals.
  await gscCoreVoting.authorize(gscVault.address);
  await gscCoreVoting.setOwner(timeLock.address);
  console.log("set permissions for time gsc core voting");

  return {
    elementToken: votingToken.address,
    coreVoting: coreVoting.address,
    gscCoreVoting: gscCoreVoting.address,
    gscVault: gscVault.address,
    timeLock: timeLock.address,
    lockingVault: lockingVault.address,
    vestingVault: vestingVault.address,
    optimisticRewardsVault: optimisticRewardsVault.address,
    airdropContract: airdropContract.address,
  };
}

async function giveRewardsVaultTokens(
  accounts: Account[],
  votingToken: MockERC20,
  signer: SignerWithAddress,
  optimisticRewardsVault: MerkleRewards
) {
  const totalValueBN = accounts.reduce((total: BigNumber, account: Account) => {
    const { value } = account;
    return total.add(value);
  }, BigNumber.from(0));
  const tokenContract = MockERC20__factory.connect(votingToken.address, signer);
  const setBalanceTx = await tokenContract.setBalance(
    optimisticRewardsVault.address,
    totalValueBN
  );
  await setBalanceTx.wait(1);
}
