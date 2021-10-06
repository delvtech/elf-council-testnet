import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hre, { ethers } from "hardhat";
import { deployCoreVoting } from "src/scripts/deployCoreVoting";
import { deployGSCVault } from "src/scripts/deployGSCVault";
import { deployLockingVault } from "src/scripts/deployLockingVault";
import { deployTimelock } from "src/scripts/deployTimelock";
import { deployVotingToken } from "src/scripts/deployVotingToken";
import { SimpleProxy__factory } from "types/factories/SimpleProxy__factory";

async function main() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;

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
    ethers.constants.AddressZero,
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

  await gscCoreVoting.authorize(gscVault.address);
  console.log("authorizing timelock");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
