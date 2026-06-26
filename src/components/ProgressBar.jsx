import React from "react";

const ProgressBar = ({ percentage, size = "md", showLabel = true }) => {
  const cleanPercent = Math.min(100, Math.max(0, Math.round(percentage)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  // Determine progress bar color based on progress percentage
  const getColor = (pct) => {
    if (pct >= 100) return "bg-success";
    if (pct > 75) return "bg-emerald-500";
    if (pct > 30) return "bg-primary";
    return "bg-amber-500";
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold">
          <span className="text-gray-500 dark:text-slate-400">Repayment Progress</span>
          <span className={`${cleanPercent === 100 ? "text-success" : "text-primary dark:text-primary-dark"}`}>
            {cleanPercent}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden dark:bg-slate-700 ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColor(cleanPercent)}`}
          style={{ width: `${cleanPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
