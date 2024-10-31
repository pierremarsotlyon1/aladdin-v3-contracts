
export interface IVotiumBribe {
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

export interface IVotiumBribeResponse {
    success: boolean;
    epoch: IVotiumBribe;
}