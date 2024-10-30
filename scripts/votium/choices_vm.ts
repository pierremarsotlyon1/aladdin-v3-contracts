/* eslint-disable node/no-extraneous-import */
/* eslint-disable camelcase */
import { Command } from "commander";
import axios from "axios";
import * as fs from "fs";
import assert from "assert";
import snapshot from "@snapshot-labs/snapshot.js";
import { createPublicClient, formatUnits, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';

const directory = ".store/vlcvx";
const CRV_GAUGE_CONTROLLER = "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB" as `0x${string}`;
const CONVEX_VOTER = "0x989AEb4d175e16225E39E87d0D97A3360524AD80" as `0x${string}`;
const VE_CRV = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2" as `0x${string}`;
const gcAbi = parseAbi([
  'function gauge_relative_weight(address gauge) external view returns(uint256)',
  'function get_gauge_weight(address gauge) external view returns(uint256)',
  'function vote_user_slopes(address voter, address gauge) external view returns((uint256, uint256, uint256))',
  'function totalSupply() external view returns(uint256)',
]);
const program = new Command();
program.version("1.0.0");

export declare type ProposalType = "single-choice" | "approval" | "quadratic" | "ranked-choice" | "weighted" | "basic";

interface ISnapshotVote {
  from?: string;
  space: string;
  timestamp?: number;
  proposal: string;
  type: ProposalType;
  choice:
    | number
    | number[]
    | string
    | {
        [key: string]: number;
      };
  privacy?: string;
  reason?: string;
  app?: string;
  metadata?: string;
}

interface ISnapshotProposal {
  author: string;
  body: string;
  choices: string[];
  created: number;
  discussion: string;
  end: number;
  id: string;
  ipfs: string;
  network: string;
  plugins: {};
  privacy: string;
  quorum: number;
  scores: number[];
  scores_by_strategy: number[][];
  scores_state: string;
  scores_total: number;
  snapshot: string;
  space: {
    id: string;
    name: string;
  };
  start: number;
  state: string;
  strategies: {
    name: string;
    network: string;
    params: {
      symbol: string;
      address: string;
      decimals: number;
    };
  }[];
  symbol: string;
  title: string;
  type: string;
  validation: {
    name: string;
    params: {};
  };
  votes: number;
}

interface ISnapshotProposalResponse {
  data: {
    proposal: ISnapshotProposal;
  };
}

interface ISnapshotVotes {
  choice: { [id: number]: number };
  created: number;
  ipfs: string;
  reason: string;
  voter: string;
  vp: number;
  vp_by_strategy: number[];
}

interface ISnapshotVotesResponse {
  data: {
    votes: ISnapshotVotes[];
  };
}

interface IVotiumBribe {
  platform: string;
  proposal: string;
  protocol: string;
  round: number;
  end: number;
  bribes: {
    amount: number;
    amountDollars: number;
    pool: string;
    token: string;
  }[];
  bribed: { [pool: string]: number };
}

interface IVotemarketBribe {
  snapshotProposalId: string;
  startRoundTimestamp: number;
  endRoundTimestamp: number;
  crvPerCvx: number;
  vlCVXSupply: number;
  veCrvHeldByConvex: number;
  totalDepositedUSD: number;
  incentives: Incentive[];
}

interface Incentive {
  gaugeName: string;
  gaugeAddress: `0x${string}`;
  amountDepositedUSD: number;
  blacklistedAddresses: `0x${string}`[];
  remainingWeek: number;
  platforms: ('convex' | 'votemarket')[];
  timestampPeriod: number
}

type IVotemarketBribeResponse = Record<string, IVotemarketBribe>;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchVotes(proposalId: string, users: number): Promise<ISnapshotVotes[]> {
  const batchSize = 100;
  const votes: ISnapshotVotes[] = [];
  for (let skip = 0; skip < users; skip += batchSize) {
    const response = await axios.post<ISnapshotVotesResponse>(
      "https://hub.snapshot.org/graphql",
      JSON.stringify({
        operationName: "Votes",
        variables: {
          first: batchSize,
          orderBy: "vp",
          orderDirection: "desc",
          skip,
          id: proposalId,
        },
        query:
          "query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String, $space: String) {\n  votes(\n    first: $first\n    skip: $skip\n    where: {proposal: $id, vp_gt: 0, voter: $voter, space: $space}\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    ipfs\n    voter\n    choice\n    vp\n    vp_by_strategy\n    reason\n    created\n  }\n}",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
    votes.push(...response.data.data.votes);
  }

  return votes;
}

interface Input {
  gaugeName: string;
  gaugeAddress: `0x${string}`;
  platform: 'votium' | 'votemarket';
  remainingDuration: number;
  currentNonBlacklistedVeCrvVotes: number;
  currentConvexVeCrvVotes: number;
  depositedRewardsUSD: number;
  currentCvxSnapshotVotes: number;
  voterCvxCurrentVotes: number;
  choiceIndex: number;
  timestampPeriod: number;
  earnings: number;
}

interface LagrangeInput {
  gaugeName: string;
  gaugeAddress: `0x${string}`;
  bi: number;
  si: number;
  sqrt: number;
  xi: number;
  choiceIndex: number;
}

async function compute(
  voter: string,
  holderVotes: number,
  minProfitUSD: number,
  proposal: ISnapshotProposal,
  incentives: Incentive[],
  votes: ISnapshotVotes[],
  roundData: IVotemarketBribe
): Promise<LagrangeInput[]> {

  const {data: {data: curveApiResp}} = await axios.get(`https://api.curve.fi/api/getAllGauges`);
  const allGauges = Object.values(curveApiResp);

  const now = Math.floor(Date.now() / 1000)
  const period = now; // Math.floor(now / (86400 * 7)) * (86400 * 7);

  // Fetch inputs
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http("https://lb.drpc.org/ogrpc?network=ethereum&dkey=Ak80gSCleU1Frwnafb5Ka4W15CoRE1QR77g0svbGyHm5"),
    batch: {
      multicall: true
    }
  });

  // Voter votes availables
  const fetchedVp = await snapshot.utils.getScores(
    "cvx.eth",
    proposal.strategies,
    proposal.network,
    [voter],
    proposal.snapshot
  );

  let voterVotingPower = 0;
  for (const v of fetchedVp) {
    if (v?.[voter as string]) {
      voterVotingPower += v?.[voter as string] || 0;
    }
  }

  // Current non blacklisted veCRV votes / convex current vote
  const results = await publicClient.multicall({
    contracts: incentives.map((incentive) => {
      return [
        {
          address: CRV_GAUGE_CONTROLLER,
          abi: gcAbi,
          functionName: "get_gauge_weight",
          args: [incentive.gaugeAddress]
        },
        {
          address: CRV_GAUGE_CONTROLLER,
          abi: gcAbi,
          functionName: "vote_user_slopes",
          args: [CONVEX_VOTER, incentive.gaugeAddress]
        },
        ...incentive.blacklistedAddresses.map((blacklistedAddress) => ({
          address: CRV_GAUGE_CONTROLLER,
          abi: gcAbi,
          functionName: "vote_user_slopes",
          args: [blacklistedAddress, incentive.gaugeAddress]
        }))
      ]
    })
      .flat(),
  });

  // Decode and create inputs
  const inputs: Input[] = [];

  for(const incentive of incentives) {
    const relativeWeightResp = results.shift() as any;
    const convexSlope = results.shift() as any;

    let relativeWeight = 0;
    let convexVote = 0;

    if (relativeWeightResp.result) {
      relativeWeight = parseFloat(formatUnits(BigInt(relativeWeightResp.result as any), 18))
    }

    if(convexSlope.result) {
      const slope = convexSlope.result[0];
      const end = convexSlope.result[2];
      convexVote = parseFloat(formatUnits(BigInt(slope * (end - BigInt(period))), 18));
    }

    // Blacklist
    incentive.blacklistedAddresses.forEach(() => {
      const blacklistSlope = results.shift() as any;
      if (blacklistSlope.result) {
        const slope = blacklistSlope.result[0];
        const end = blacklistSlope.result[2];
        relativeWeight -= parseFloat(formatUnits(BigInt(slope * (end - BigInt(period))), 18));
      }
    });

    // Get shortName associated from curve api
    const shortName = (allGauges.find((gaugeData: any) =>
      gaugeData.gauge.toLowerCase() === incentive.gaugeAddress.toLowerCase()
      || gaugeData.swap?.toLowerCase() === incentive.gaugeAddress.toLowerCase()
    ) as any)?.shortName || undefined;
    if (shortName === undefined) {
      console.log("error", incentive.gaugeAddress)
      continue;
    }

    let currentCvxSnapshotVotes = 0;
    let choiceIndex = 0;
    for (let i = 0; i < proposal.choices.length; i++) {
      const choice = proposal.choices[i];

      if (choice.toLowerCase().startsWith(shortName.toLowerCase())) {
        currentCvxSnapshotVotes = proposal.scores[i];
        choiceIndex = i + 1;
        break;
      }
    }

    let voterCvxCurrentVotes = 0;
    const voterVoteSnapshot = votes.find((vote) => vote.voter.toLowerCase() === voter.toLowerCase());
    if(voterVoteSnapshot && voterVoteSnapshot.choice[choiceIndex]) {
      const sumWeight = Object.values(voterVoteSnapshot.choice).reduce((acc: number, v: number) => acc + v, 0);
      voterCvxCurrentVotes = voterVoteSnapshot.choice[choiceIndex] * voterVoteSnapshot.vp / sumWeight;
    }

    inputs.push({
      gaugeName: incentive.gaugeName,
      gaugeAddress: incentive.gaugeAddress,
      remainingDuration: incentive.remainingWeek,
      depositedRewardsUSD: incentive.amountDepositedUSD,
      platform: incentive.platforms.includes("convex") ? "votium" : "votemarket",
      currentConvexVeCrvVotes: convexVote,
      currentCvxSnapshotVotes,
      currentNonBlacklistedVeCrvVotes: relativeWeight,
      voterCvxCurrentVotes,
      choiceIndex,
      timestampPeriod: incentive.timestampPeriod || 0,
      earnings: 0
    });
  }

  // Iterate to maximize votes
  let lagrangeDatas: LagrangeInput[] = [];
  inputs.forEach((input) => {
    lagrangeDatas.push({
      bi: -1,
      si: -1,
      sqrt: -1,
      xi:-1,
      gaugeName: input.gaugeName,
      gaugeAddress: input.gaugeAddress,
      choiceIndex: input.choiceIndex,
    })
  })

  fs.writeFileSync("./inputs.json", JSON.stringify(inputs), {encoding: 'utf-8'});

  const totalVotesSum = inputs.reduce((acc: number, input) => acc + input.voterCvxCurrentVotes, 0);
  console.log("totalVotesSum", totalVotesSum)
  for (let h = 0; h < 4; h++) {
    const isFirstIteration = h === 0;

    for (let a = 0; a < inputs.length; a++) {
      const input = inputs[a];
      const lagrangeData = lagrangeDatas[a];

      let depositedRewardsUSD = 0;
      if (input.platform === 'votium') {
        depositedRewardsUSD = input.depositedRewardsUSD;
      } else {
        depositedRewardsUSD = input.depositedRewardsUSD * Math.min(2, input.remainingDuration);
      }
      if(isFirstIteration) {
        // If first iteration, we compute wil inputs data bi, vi, si
        if (input.platform === 'votium') {
          lagrangeData.bi = depositedRewardsUSD;
          lagrangeData.si = input.currentCvxSnapshotVotes - input.voterCvxCurrentVotes;
        } else {
          lagrangeData.bi = depositedRewardsUSD;
          lagrangeData.si =
            (Math.max(input.currentNonBlacklistedVeCrvVotes - input.currentConvexVeCrvVotes, 0)
              / roundData.crvPerCvx)
            + input.currentCvxSnapshotVotes
            - input.voterCvxCurrentVotes;
        }
      } else {
        lagrangeData.bi = lagrangeData.xi > 0 ? lagrangeData.bi : 0;
        lagrangeData.si = lagrangeData.xi > 0 ? lagrangeData.si : 0;
      }

      lagrangeData.sqrt = Math.sqrt(lagrangeData.bi * lagrangeData.si);
    }

    const sumSi = lagrangeDatas.reduce((acc: number, lagrangeData) => acc + lagrangeData.si, 0);
    const sumSqrt = lagrangeDatas.reduce((acc: number, lagrangeData) => acc + lagrangeData.sqrt, 0);
    console.log("sumSi", sumSi)
    console.log("sumSqrt", sumSqrt)
    console.log("-----")
    for (let a = 0; a < inputs.length; a++) {
      const lagrangeData = lagrangeDatas[a];
      if(isFirstIteration && inputs[a].gaugeAddress === "0xd03BE91b1932715709e18021734fcB91BB431715" && lagrangeData.bi > 1) {
        console.log("sumSi", sumSi)
        console.log("totalVotesSum", totalVotesSum)
        console.log("lagrangeData.sqrt", lagrangeData.sqrt)
        console.log("sumSqrt", sumSqrt)
        console.log("lagrangeData.si", lagrangeData.si)
      }
      lagrangeData.xi = (((sumSi + totalVotesSum) * lagrangeData.sqrt) / sumSqrt) - lagrangeData.si;
    }
    //fs.writeFileSync(`./.store/vlcvx/lagrangeDatas/lagrangeData-${h}.json`, JSON.stringify(lagrangeDatas.sort((a, b) => b.si - a.si)), {encoding: 'utf-8'});
  }

  // Calculate earnings
  for (let i = 0; i < lagrangeDatas.length; i++) {
    const lagrangeData = lagrangeDatas[i];
    const input = inputs[i];

    const currentSnapshotVotes = (proposal.scores[input.choiceIndex - 1] || 0);
    const totalVlCvxVotes = currentSnapshotVotes - input.voterCvxCurrentVotes + lagrangeData.xi
    const totalVecrvVotes = input.currentNonBlacklistedVeCrvVotes - input.currentConvexVeCrvVotes + totalVlCvxVotes * roundData.crvPerCvx;
    let bribeRewardsUSD = 0;
    if (input.platform === "votium") {
      bribeRewardsUSD = input.depositedRewardsUSD;
    } else {
      bribeRewardsUSD = Math.min(2, input.remainingDuration) * input.depositedRewardsUSD;
    }

    const usdPervecrv = totalVecrvVotes === 0 ? 0 : Math.min(bribeRewardsUSD / totalVecrvVotes, 1);
    const usdPerVlCvx = usdPervecrv * roundData.crvPerCvx;
    input.earnings += usdPerVlCvx * lagrangeData.xi;

    if(input.gaugeAddress === "0x740BA8aa0052E07b925908B380248cb03f3DE5cB") {
      console.log(input.gaugeName)
      console.log(currentSnapshotVotes)
      console.log(totalVlCvxVotes)
      console.log(totalVecrvVotes)
      console.log(bribeRewardsUSD)
      console.log(usdPervecrv)
      console.log(usdPerVlCvx)
      console.log(lagrangeData.xi)
      console.log(usdPerVlCvx * lagrangeData.xi)
      console.log(lagrangeData)
      console.log("------")
    }
  }

  lagrangeDatas.sort((a, b) => a.xi - b.xi);
  
  fs.writeFileSync("./inputs.json", JSON.stringify(inputs), {encoding: 'utf-8'});

  const totalEarnings = inputs.reduce((acc: number, i) => acc + i.earnings, 0)
  console.log("totalEarnings", totalEarnings)
  fs.writeFileSync("./lagrangeDatas.json", JSON.stringify(lagrangeDatas.reverse().map((l) => ({weight: l.xi, name: l.gaugeName, gauge: l.gaugeAddress}))), {encoding: 'utf-8'});
  return lagrangeDatas.filter((lagrange) => lagrange.xi > 0);
}

export async function get_choices_with_votemarket(
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
): Promise<{proposalId: string, choices: any} | undefined> {
  if (!["CRV"].includes(protocol)) {
    throw Error("invalid protocol");
  }
  const proposal_file = `${directory}/${protocol}/${round}.proposal.json`;
  const votes_file = `${directory}/${protocol}/${round}.votes.json`;

  if (voteConfig) force = true;

  // Fetch votemarket analytics
  /*const { data: response } = await axios.get<IVotemarketBribeResponse>(
    `https://raw.githubusercontent.com/stake-dao/votemarket-analytics/refs/heads/main/analytics/votemarket-vlcvx-analytics.json`,
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    }
  );*/

  const response =  JSON.parse(fs.readFileSync(`${directory}/${protocol}/vlcvx.json`).toString()) as any;

  const roundData = response[round];
  assert.ok(roundData !== undefined, "round mismatch");

  const bribes = response[round].incentives;
  const proposalId = roundData.snapshotProposalId;

  // load data
  let proposal: ISnapshotProposal;
  if (fs.existsSync(proposal_file) && !force) {
    proposal = JSON.parse(fs.readFileSync(proposal_file).toString());
  } else {
    const response = await axios.post<ISnapshotProposalResponse>(
      "https://hub.snapshot.org/graphql",
      JSON.stringify({
        operationName: "Proposal",
        variables: {
          id: proposalId,
        },
        query:
          "query Proposal($id: String!) {\n  proposal(id: $id) {\n    id\n    ipfs\n    title\n    body\n    discussion\n    choices\n    start\n    end\n    snapshot\n    state\n    author\n    created\n    plugins\n    network\n    type\n    quorum\n    symbol\n    privacy\n    strategies {\n      name\n      network\n      params\n    }\n    space {\n      id\n      name\n    }\n    scores_state\n    scores\n    scores_by_strategy\n    scores_total\n    votes\n  }\n}",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
    proposal = response.data.data.proposal;
    console.log("save proposal data to:", proposal_file);
    fs.writeFileSync(proposal_file, JSON.stringify(proposal));
  }

  let votes: ISnapshotVotes[];
  if (fs.existsSync(votes_file) && !force) {
    votes = JSON.parse(fs.readFileSync(votes_file).toString());
  } else {
    votes = await fetchVotes(proposalId, proposal.votes);
    console.log("save votes data to:", votes_file);
    fs.writeFileSync(votes_file, JSON.stringify(votes));
  }

  // do verification
  const scores: number[] = new Array(proposal.choices.length);
  scores.fill(0);
  let totalVotes = 0;
  for (const vote of votes) {
    let sum = 0;
    for (const value of Object.values(vote.choice)) {
      sum += value;
    }
    for (const [pool, value] of Object.entries(vote.choice)) {
      scores[parseInt(pool) - 1] += (vote.vp * value) / sum;
    }
    totalVotes += vote.vp;
  }
  assert.strictEqual(proposal.votes, votes.length, "user count mismatch");
  assert.strictEqual(proposal.id, proposalId, "proposal_id mismatch");

  console.log("User voted:", proposal.votes);
  console.log("Remote total votes:", proposal.scores_total);
  console.log("Computed total votes:", totalVotes);
  console.log("Min profit usd:", minProfitUSD);
  console.log("\nCurrent Status:");
  for (let i = 0; i < scores.length; i++) {
    if (proposal.scores[i] === 0) {
      assert.strictEqual(scores[i], 0, `votes mismatch for choice[${proposal.choices[i]}]`);
    } else {
      console.log(
        `  + choice[${proposal.choices[i]}] remote_votes[${proposal.scores[i]}] computed_votes[${scores[i]}]`
      );
      const absError = Math.abs(proposal.scores[i] - scores[i]);
      if (absError > 1e-5) {
        assert.fail(`absolute error[${absError}] for choice[${proposal.choices[i]}] exceed 1e-5`);
      }
    }
  }

  if (voter) {
    const results = await compute(voter, holderVotes, minProfitUSD, proposal, bribes, votes, roundData);
    const choices: { [index: string]: number } = {};
    results.forEach((result) => {
      choices[result.choiceIndex.toString()] = result.xi;
    });
    return {proposalId, choices}
  }

  return undefined;
}

