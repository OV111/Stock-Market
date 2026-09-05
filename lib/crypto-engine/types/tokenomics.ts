export interface TokenomicsData {
  inflationRate: number; // annual %
  emissionSchedule?: EmissionSchedule[];
  vestingSchedule?: VestingSchedule[];
  stakingYield?: number; // annual %
  stakingRatio?: number; // % of supply staked
  governanceParticipation?: number; // % of voting supply
  distribution: {
    top10Percent?: number;
    top100Percent?: number;
    giniCoefficient?: number;
  };
  unlocksNext6m: number; // tokens
  unlocksNext12m: number;
  totalUnlockedPercent: number; // % of max supply
  isDeflationary: boolean;
  buybackBurn?: boolean;
}

export interface EmissionSchedule {
  year: number;
  annualEmission: number; // tokens
  inflationRate: number; // %
}

export interface VestingSchedule {
  date: Date;
  tokensUnlocked: number;
  percentOfTotal: number;
}
