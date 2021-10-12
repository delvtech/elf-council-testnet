import { Request, Response } from "express";

interface Proof {
  address: string;
  proof: string[];
}

export const getMerkleProof = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const proof: Proof = {
      address,
      proof: ["0xDEADBEEF", "0xDEADBEEF", "0xDEADBEEF"],
    };
    return res.status(200).send(proof);
  } catch (e) {
    res.status(500).send(e.message);
  }

  res.status(404).send("proof not found");
};
