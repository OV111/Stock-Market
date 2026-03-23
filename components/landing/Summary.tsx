import { TrendingUp, Star, Newspaper } from "lucide-react";

const items = [
  {
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
    iconBg: "bg-blue-500/10",
    title: "Real-time Prices",
    description:
      "Live stock data updated instantly. Track price movements, percentage changes, and market trends as they happen.",
  },
  {
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    iconBg: "bg-yellow-500/10",
    title: "Smart Watchlist",
    description:
      "Save and monitor the stocks that matter to you. Set price alerts and never miss a market move.",
  },
  {
    icon: <Newspaper className="w-6 h-6 text-teal-400" />,
    iconBg: "bg-teal-500/10",
    title: "Market News",
    description:
      "Stay informed with the latest financial news and insights, filtered by the stocks you follow.",
  },
];

const Summary = () => {
  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent">
          Everything you need to track the market
        </h2>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Stoxly gives you the tools to stay on top of your investments —
          simple, fast, and always live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-4 rounded-xl border  p-6"
          >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.iconBg}`}>
              {item.icon}
            </div>
            <h3 className="text-white font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Summary;
