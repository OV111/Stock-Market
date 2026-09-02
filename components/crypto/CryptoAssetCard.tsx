"use client";

import Image from "next/image";
import { Check, TrendingDown, TrendingUp } from "lucide-react";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import { Button } from "@/components/ui/button";

export type CryptoMarketAsset = {
  symbol: string;
  ticker: string;
  name: string;
  image?: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
};

type CryptoAssetCardProps = {
  asset: CryptoMarketAsset;
  selected: boolean;
  onSelect: (symbol: string) => void;
};

const formatPrice = (price: number) =>
  price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const CryptoAssetCard = ({
  asset,
  selected,
  onSelect,
}: CryptoAssetCardProps) => {
  const isPositive = asset.changePercent >= 0;

  return (
    <article
      onClick={() => onSelect(asset.symbol)}
      className={`cursor-pointer rounded-xl border p-5 transition-colors ${
        selected
          ? "border-teal-400/60 bg-teal-400/5"
          : "border-gray-600 bg-gray-800 hover:border-gray-500"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-700/70">
            {asset.image ? (
              <Image
                src={asset.image}
                alt=""
                width={24}
                height={24}
                className="size-6"
              />
            ) : (
              <span className="font-mono text-[10px] text-yellow-400">
                {asset.ticker.slice(0, 2)}
              </span>
            )}
          </span>
          <div className="flex flex-col gap-1">
            <span className="inline-block w-fit rounded bg-gray-700 px-2 py-0.5 font-mono text-xs font-semibold text-yellow-400">
              {asset.ticker}
            </span>
            <span className="text-sm font-semibold text-gray-300">
              {asset.name}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${
              isPositive
                ? "bg-teal-400/10 text-teal-400"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {isPositive ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </div>

          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded border ${
              selected
                ? "border-teal-400 bg-teal-400 text-gray-950"
                : "border-gray-600"
            }`}
          >
            {selected && <Check className="size-3.5 stroke-[3]" />}
          </span>
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-100">
        ${formatPrice(asset.price)}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          Change:{" "}
          <span className={isPositive ? "text-teal-400" : "text-red-500"}>
            {isPositive ? "+" : ""}${asset.change.toFixed(4)}
          </span>
        </span>
        <span>
          H: ${asset.high.toFixed(2)} · L: ${asset.low.toFixed(2)}
        </span>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <AddTransactionModal
          defaultSymbol={asset.symbol}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5 w-full border-gray-700 bg-transparent text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              Log transaction
            </Button>
          }
        />
      </div>
    </article>
  );
};

export default CryptoAssetCard;
