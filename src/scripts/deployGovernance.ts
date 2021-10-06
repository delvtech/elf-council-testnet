import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { getMerkleTree } from "src/merkle";
import { deployCoreVoting } from "src/scripts/deployCoreVoting";
import { deployGSCVault } from "src/scripts/deployGSCVault";
import { deployLockingVault } from "src/scripts/deployLockingVault";
import { deployOptimisticRewards } from "src/scripts/deployOptimisticRewards";
import { deployTimelock } from "src/scripts/deployTimelock";
import { deployVotingToken } from "src/scripts/deployVotingToken";
import { CoreVoting } from "types/CoreVoting";
import { SimpleProxy__factory } from "types/factories/SimpleProxy__factory";
import { GSCVault } from "types/GSCVault";
import { MockERC20 } from "types/MockERC20";
import { OptimisticRewards } from "types/OptimisticRewards";
import { SimpleProxy } from "types/SimpleProxy";
import { Timelock } from "types/Timelock";

const ONE_ETHER = ethers.utils.parseEther("1");

export interface GovernanceContracts {
  elementToken: MockERC20;
  coreVoting: CoreVoting;
  gscCoreVoting: CoreVoting;
  gscVault: GSCVault;
  timeLock: Timelock;
  lockingVault: SimpleProxy;
  optimisticRewardsVault: OptimisticRewards;
}

export async function deployGovernanace(
  signer: SignerWithAddress,
  signers: SignerWithAddress[]
): Promise<GovernanceContracts> {
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

  const accounts = [];
  for (const i in signers) {
    accounts.push({
      address: signers[i].address,
      value: ONE_ETHER,
    });
  }
  const merkleTree = await getMerkleTree(accounts);
  const optimisticRewardsVault = await deployOptimisticRewards(
    signer,
    coreVoting.address,
    merkleTree,
    votingToken.address,
    lockingVault.address
  );
  console.log("deployed rewards vault");

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
    elementToken: votingToken,
    coreVoting,
    gscCoreVoting,
    gscVault,
    timeLock,
    lockingVault,
    optimisticRewardsVault,
  };
}
