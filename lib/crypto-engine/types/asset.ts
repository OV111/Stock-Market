import { AssetCategory } from "./enums";

export interface Asset {
  id: string; // CoinGecko ID
  symbol: string;
  name: string;
  blockchain: string;
  contractAddress?: string; // for ERC-20/BEP-20 etc.
  genesisDate?: Date;
  website?: string;
  description?: string;
  categories: AssetCategory[];
  isStablecoin: boolean;
  isMemeCoin: boolean;
  isDeFi: boolean;
  isGaming: boolean;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetMetadata {
  id: string;
  symbol: string;
  name: string;
  rank?: number; // market cap rank
}
