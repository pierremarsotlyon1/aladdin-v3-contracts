import axios from "axios";
import { ISnapshotVotes, ISnapshotVotesResponse } from "scripts/interfaces/snapshot";

export async function fetchVotes(proposalId: string, users: number): Promise<ISnapshotVotes[]> {
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