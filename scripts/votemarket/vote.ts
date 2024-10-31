/* eslint-disable node/no-extraneous-import */
/* eslint-disable camelcase */
import { Command } from "commander";
import { get_choices_with_votemarket } from "../votemarket/snapshot_vote";
import { cast_vote } from "scripts/snapshot/castVote";

const program = new Command();
program.version("1.0.0");

async function snapshot_vote(
  protocol: string,
  round: number,
  voter: string,
  holderVotes: number,
  minProfitUSD: number,
  force: boolean,
  voteConfig?: {
    private: string;
    mode: string;
    autoInterval: number;
  }
) {
  if (!["CRV"].includes(protocol)) {
    throw Error("invalid protocol");
  }

  const voteData = await get_choices_with_votemarket(protocol, round, voter, holderVotes, minProfitUSD, force, voteConfig);
  if (voteData === undefined) {
    console.log("Can't compute CRV votes");
    return;
  }

  console.log("Vote choices:", voteData.choices);
  await cast_vote(voteData.proposalId, voter, voteData.choices, voteConfig)
}

async function main() {
  const snapshot_cli = program.command("snapshot").description("Snapshot Vote CLI");
  snapshot_cli.option("--protocol <protocol>", "the protocol to vote, choice: [CRV]");
  snapshot_cli.option("--round <round>", "round number");
  snapshot_cli.option("--voter <voter>", "the address of voter");
  snapshot_cli.option("--votes <votes>", "number of votes you have");
  snapshot_cli.option("--min-profit-usd <min profit usd>", "the minimum profit in USD in each choice", "1000");
  snapshot_cli.option("--force", "whether to force update local cache");
  snapshot_cli.option("--private <private key>", "the private key of signer", "");
  snapshot_cli.option("--mode <mode>", "current vote mode: manual, auto", "manual");
  snapshot_cli.option("--auto-interval <interval>", "the number of seconds between each vote when in auto mode", "60");
  snapshot_cli.action(async () => {
    const opts = snapshot_cli.opts();
    console.log(opts);
    await snapshot_vote(
      opts.protocol,
      parseInt(opts.round),
      opts.voter,
      parseFloat(opts.votes),
      parseFloat(opts.minProfitUsd),
      opts.force,
      opts.private
        ? {
          private: opts.private!,
          mode: opts.mode || "manual",
          autoInterval: parseInt(opts.autoInterval || "60"),
        }
        : undefined
    );
  });

  await program.parseAsync(process.argv);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
