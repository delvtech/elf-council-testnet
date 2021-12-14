import { GSCVault, GSCVault__factory } from 'elf-council-typechain';
import { BigNumberish, Signer } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  syncContractWithEthernal,
} from 'src/ethernal/syncContractWithEthernal';

export async function deployGSCVault(
  hre: HardhatRuntimeEnvironment,
  signer: Signer,
  coreVotingAddress: string,
  votingPowerBound: BigNumberish,
  governanceOwnerAddress: string
): Promise<GSCVault> {
  const GSCDeployer = new GSCVault__factory(signer);
  const GSCContract = await GSCDeployer.deploy(
    coreVotingAddress,
    votingPowerBound,
    governanceOwnerAddress
  );

  await syncContractWithEthernal(hre, "GSCVault", GSCContract.address);

  return GSCContract;
}
