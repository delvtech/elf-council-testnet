import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  CoreVoting__factory,
  LockingVault__factory,
} from "elf-council-typechain";
import { BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";

import addressesJson from "src/addresses";

export async function testVote(
  signer: SignerWithAddress,
  proposalId: BigNumberish,
  ballot: number
): Promise<void> {
  const {
    addresses: { lockingVault, coreVoting },
  } = addressesJson;
  60;

  const coreVotingContract = CoreVoting__factory.connect(coreVoting, signer);

  const lockingVaultContract = LockingVault__factory.connect(
    lockingVault,
    signer
  );

  const proposal = await coreVotingContract.proposals(proposalId);
  console.log("proposal", proposal);
  const { created } = proposal;

  const votingPower = await lockingVaultContract.queryVotePowerView(
    signer.address,
    created
    // "0x00"
  );
  // await votingPower.wait(1);

  console.log("votingPower", votingPower);

  try {
    await coreVotingContract.vote(
      [lockingVault],
      ["0x01"],
      proposalId,
      ballot
      // {
      //   gasLimit: "30000000",
      // }
    );
  } catch (error) {
    // console.log("error", error);
    console.log(
      "vote failed with args: ",
      [lockingVault],
      ["0x00"],
      proposalId,
      ballot
    );
  }
}
