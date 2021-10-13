import express from "express";

import { getMerkleProof } from "../controllers/merkleProof";

export const merkleProofRouter = express.Router();
merkleProofRouter.get("/:address", getMerkleProof);
