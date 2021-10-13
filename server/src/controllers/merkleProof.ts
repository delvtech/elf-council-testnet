import { parseEther } from "@ethersproject/units";
import { BigNumber } from "ethers";
import { Request, Response } from "express";

import { getMerkleTree } from "../helpers/merkle";
import leaves from "../leaves.json";

interface MerkleProofResponse {
  leaf: {
    address: string;
    value: string;
  };
  proof: number[][];
}

interface Account {
  address: string;
  value: BigNumber;
}
export const getMerkleProof = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const accountIndex: number = leaves.findIndex(
      (leaf) => leaf.address === address
    );

    if (accountIndex < 0) {
      return res.status(404).send("address not found");
    }

    const account = leaves[accountIndex];
    const accounts: Account[] = leaves.map(({ address, value }) => ({
      address,
      value: parseEther(value),
    }));

    const merkleTree = await getMerkleTree(accounts);
    const leaf = merkleTree.getLeaves()[accountIndex];
    // serialize the data, client side will need to convert back to buffer's using Buffer.from(data)
    const proof = merkleTree.getProof(leaf).map((p) => p.data.toJSON().data);

    const response: MerkleProofResponse = {
      leaf: {
        address,
        value: account.value,
      },
      proof,
    };
    return res.status(200).send(response);
  } catch (e) {
    res.status(500).send(e.message);
  }

  res.status(404).send("proof not found");
};
