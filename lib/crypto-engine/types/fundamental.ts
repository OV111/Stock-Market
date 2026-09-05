export interface DeveloperActivity {
  commits30d: number;
  activeDevs30d: number;
  trend: "increasing" | "decreasing" | "stable";
  stars?: number;
  forks?: number;
}

export interface EcosystemMetrics {
  activeAddresses30d?: number;
  transactions30d?: number;
  tvl?: number; // Total Value Locked (DeFi)
  dexVolume30d?: number;
  uniqueWallets?: number;
}

export interface FundamentalData {
  useCase: string;
  blockchainArchitecture: string;
  consensusMechanism: string;
  developerActivity: DeveloperActivity;
  ecosystem: EcosystemMetrics;
  competitors: string[];
  ecosystemGrowthQoq?: number; // quarter-over-quarter
  adoptionIndicators: {
    merchantAdoption?: boolean;
    institutionalInterest?: boolean;
    partnerships?: string[];
  };
  securityAudits?: string[]; // audit firms
  governanceModel?: string;
}
