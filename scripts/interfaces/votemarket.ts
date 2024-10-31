export interface IVotemarketBribe {
    snapshotProposalId: string;
    startRoundTimestamp: number;
    endRoundTimestamp: number;
    crvPerCvx: number;
    vlCVXSupply: number;
    veCrvHeldByConvex: number;
    totalDepositedUSD: number;
    incentives: Incentive[];
}

export interface Incentive {
    gaugeName: string;
    gaugeAddress: `0x${string}`;
    amountDepositedUSD: number;
    blacklistedAddresses: `0x${string}`[];
    remainingWeek: number;
    platforms: ('convex' | 'votemarket')[];
    timestampPeriod: number
}