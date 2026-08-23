type CandleBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type PriceChartProps = {
  candles: CandleBar[];
};

const WIDTH = 600;
const HEIGHT = 160;

const PriceChart = ({ candles }: PriceChartProps) => {
  if (candles.length === 0) return null;

  const closes = candles.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const isPositive = closes[closes.length - 1] >= closes[0];

  const points = closes.map((close, i) => {
    const x = (i / (closes.length - 1 || 1)) * WIDTH;
    const y = HEIGHT - ((close - min) / range) * HEIGHT;
    return `${x},${y}`;
  });

  const areaPoints = `0,${HEIGHT} ${points.join(" ")} ${WIDTH},${HEIGHT}`;
  const strokeColor = isPositive ? "#2dd4bf" : "#ef4444";

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-40"
      preserveAspectRatio="none"
    >
      <polygon points={areaPoints} fill={strokeColor} fillOpacity={0.08} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default PriceChart;
