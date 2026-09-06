/**
 * Ledger symbols and quote symbols must be identical. Keeping this catalogue
 * in one place prevents a transaction logged as BTC from being valued using a
 * different market instrument. `CRYPTO:<CoinGecko id>` is provider-neutral at
 * the UI level while still resolving unambiguously to its market-data asset.
 */
export const CRYPTO_ASSETS = [
  { symbol: "CRYPTO:bitcoin", ticker: "BTC", name: "Bitcoin" },
  { symbol: "CRYPTO:ethereum", ticker: "ETH", name: "Ethereum" },
  { symbol: "CRYPTO:tether", ticker: "USDT", name: "Tether" },
  { symbol: "CRYPTO:binancecoin", ticker: "BNB", name: "BNB" },
  { symbol: "CRYPTO:ripple", ticker: "XRP", name: "XRP" },
  { symbol: "CRYPTO:solana", ticker: "SOL", name: "Solana" },
  { symbol: "CRYPTO:usd-coin", ticker: "USDC", name: "USDC" },
  { symbol: "CRYPTO:tron", ticker: "TRX", name: "TRON" },
  { symbol: "CRYPTO:dogecoin", ticker: "DOGE", name: "Dogecoin" },
  { symbol: "CRYPTO:cardano", ticker: "ADA", name: "Cardano" },
  { symbol: "CRYPTO:hyperliquid", ticker: "HYPE", name: "Hyperliquid" },
  { symbol: "CRYPTO:avalanche-2", ticker: "AVAX", name: "Avalanche" },
  { symbol: "CRYPTO:sui", ticker: "SUI", name: "Sui" },
  { symbol: "CRYPTO:chainlink", ticker: "LINK", name: "Chainlink" },
  { symbol: "CRYPTO:stellar", ticker: "XLM", name: "Stellar" },
  { symbol: "CRYPTO:toncoin", ticker: "TON", name: "Toncoin" },
  { symbol: "CRYPTO:shiba-inu", ticker: "SHIB", name: "Shiba Inu" },
  { symbol: "CRYPTO:hedera-hashgraph", ticker: "HBAR", name: "Hedera" },
  { symbol: "CRYPTO:bitcoin-cash", ticker: "BCH", name: "Bitcoin Cash" },
  { symbol: "CRYPTO:polkadot", ticker: "DOT", name: "Polkadot" },
  { symbol: "CRYPTO:litecoin", ticker: "LTC", name: "Litecoin" },
  { symbol: "CRYPTO:uniswap", ticker: "UNI", name: "Uniswap" },
  { symbol: "CRYPTO:near", ticker: "NEAR", name: "NEAR Protocol" },
  { symbol: "CRYPTO:dai", ticker: "DAI", name: "Dai" },
  { symbol: "CRYPTO:internet-computer", ticker: "ICP", name: "Internet Computer" },
  { symbol: "CRYPTO:aptos", ticker: "APT", name: "Aptos" },
  { symbol: "CRYPTO:monero", ticker: "XMR", name: "Monero" },
  { symbol: "CRYPTO:cosmos", ticker: "ATOM", name: "Cosmos" },
  { symbol: "CRYPTO:ethereum-classic", ticker: "ETC", name: "Ethereum Classic" },
  { symbol: "CRYPTO:filecoin", ticker: "FIL", name: "Filecoin" },
  { symbol: "CRYPTO:arbitrum", ticker: "ARB", name: "Arbitrum" },
  { symbol: "CRYPTO:optimism", ticker: "OP", name: "Optimism" },
  { symbol: "CRYPTO:aave", ticker: "AAVE", name: "Aave" },
  { symbol: "CRYPTO:render-token", ticker: "RENDER", name: "Render" },
  { symbol: "CRYPTO:injective-protocol", ticker: "INJ", name: "Injective" },
  { symbol: "CRYPTO:algorand", ticker: "ALGO", name: "Algorand" },
  { symbol: "CRYPTO:vechain", ticker: "VET", name: "VeChain" },
  { symbol: "CRYPTO:the-graph", ticker: "GRT", name: "The Graph" },
  { symbol: "CRYPTO:maker", ticker: "MKR", name: "Maker" },
  { symbol: "CRYPTO:the-sandbox", ticker: "SAND", name: "The Sandbox" },
] as const;

export type CryptoAssetDefinition = (typeof CRYPTO_ASSETS)[number];

export const isCryptoSymbol = (symbol: string) => symbol.startsWith("CRYPTO:");
