import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Account, getMerkleTree } from "src/merkle";
import { deployCoreVoting } from "src/scripts/deployCoreVoting";
import { deployGSCVault } from "src/scripts/deployGSCVault";
import { deployLockingVault } from "src/scripts/deployLockingVault";
import { deployOptimisticRewards } from "src/scripts/deployOptimisticRewards";
import { deployTimelock } from "src/scripts/deployTimelock";
import { deployVotingToken } from "src/scripts/deployVotingToken";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { SimpleProxy__factory } from "types/factories/SimpleProxy__factory";
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
  optimisticRewardsVault: string;
}

export async function deployGovernanace(
  signer: SignerWithAddress,
  signers: SignerWithAddress[]
): Promise<GovernanceContracts> {
  console.log(
    "signers",
    signers.map((s) => s.address)
  );
  const votingToken = await deployVotingToken(signer);
  console.log("deployed voting token");

  // deploy core voting contract, we'll have to fill in address values later
  const coreVoting = await deployCoreVoting(
    signer,
    [],
    signer.address,
    // QUESTION what are good values here and why?
    1,
    1,
    ethers.constants.AddressZero
  );
  console.log("deployed empty core voting");

  // deploy the core voting vault controlled by the GSC Vault
  const gscCoreVoting = await deployCoreVoting(
    signer,
    [],
    // QUESTION: setting the singer here to the timelock owner here so I can use 'authorize' later.
    // is this right?
    signer.address,
    0,
    0,
    ethers.constants.AddressZero
  );
  console.log("deployed empty gsc core voting");

  const timeLock = await deployTimelock(
    signer,
    0,
    signer.address,
    signer.address
  );
  console.log("deployed timelock");

  const gscVault = await deployGSCVault(
    signer,
    gscCoreVoting.address,
    // QUESTION what is the power bound?  what's a good value here?
    0,
    timeLock.address
  );
  console.log("deployed gsc vault");

  // QUESTION do I need to use a wallet here?
  // const { provider } = waffle;
  // const [wallet] = provider.getWallets();
  const proxyDeployer = new SimpleProxy__factory(signer);
  console.log("deployed proxy vault");

  const lockingVaultBase = await deployLockingVault(
    signer,
    votingToken.address,
    10000
  );
  console.log("deployed locking vault base");

  const lockingVaultProxy = await proxyDeployer.deploy(
    timeLock.address,
    lockingVaultBase.address
  );

  console.log("deployed locking vault proxy");
  const lockingVault = lockingVaultProxy.attach(lockingVaultProxy.address);
  console.log("deployed locking vault");

  const accounts: Account[] = [];
  for (const i in signers) {
    accounts.push({
      address: signers[i].address,
      value: FIFTY_VOTING_TOKENS,
    });
  }

  const merkleTree = getMerkleTree(accounts);
  const optimisticRewardsVault = await deployOptimisticRewards(
    signer,
    votingToken.address,
    coreVoting.address,
    merkleTree,
    lockingVault.address
  );
  console.log("deployed rewards vault");

  await giveRewardsVaultTokens(
    accounts,
    votingToken,
    signer,
    optimisticRewardsVault
  );
  console.log("rewards vault seeded with element tokens ");

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
    optimisticRewardsVault: optimisticRewardsVault.address,
  };
}
async function giveRewardsVaultTokens(
  accounts: Account[],
  votingToken: MockERC20,
  signer: SignerWithAddress,
  optimisticRewardsVault: OptimisticRewards
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
