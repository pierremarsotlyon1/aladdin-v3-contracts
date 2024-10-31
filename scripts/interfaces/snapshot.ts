
export declare type ProposalType = "single-choice" | "approval" | "quadratic" | "ranked-choice" | "weighted" | "basic";

export interface ISnapshotVote {
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

export interface ISnapshotProposal {
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

export interface ISnapshotProposalResponse {
    data: {
        proposal: ISnapshotProposal;
    };
}

export interface ISnapshotVotes {
    choice: { [id: number]: number };
    created: number;
    ipfs: string;
    reason: string;
    voter: string;
    vp: number;
    vp_by_strategy: number[];
}

export interface ISnapshotVotesResponse {
    data: {
        votes: ISnapshotVotes[];
    };
}

