import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import snapshot from "@snapshot-labs/snapshot.js";
import { ISnapshotVote } from "scripts/interfaces/snapshot";

export async function cast_vote(
    proposalId: string,
    voter: string,
    choices: any,
    voteConfig?: {
      private: string;
      mode: string;
      autoInterval: number;
    }) {
    if (!voteConfig) {
      return false;
    }
    const provider = new JsonRpcProvider("https://rpc.ankr.com/eth");
    const account = new Wallet(voteConfig.private, provider);
  
    const hub = "https://hub.snapshot.org";
    const client = new snapshot.Client712(hub);
    const message: ISnapshotVote = {
      space: "cvx.eth",
      proposal: proposalId,
      timestamp: Math.floor(Date.now() / 1000),
      type: "weighted",
      choice: choices,
      reason: "CLever",
    };
    console.log("Do voting:", message);
    const receipt = await client.vote(account, voter, message);
    console.log("Voted:", receipt);
    return true;
  }