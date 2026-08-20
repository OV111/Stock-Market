const DashboardHeader = () => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent">
          Market Overview
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Each panel streams independently. A failed slot never blocks the rest of the page.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 whitespace-nowrap pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          LIVE
        </span>
        <span className="text-gray-700">·</span>
        <span>NYSE OPEN</span>
        <span className="text-gray-700">·</span>
        <span>14:32:07 ET</span>
      </div>
    </div>
  );
};

export default DashboardHeader;
