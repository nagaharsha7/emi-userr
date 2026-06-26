import React from "react";

const DashboardCard = ({ title, value, icon: Icon, color = "primary", trend }) => {
  const colorStyles = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-success bg-success/10 border-success/20",
    danger: "text-danger bg-danger/10 border-danger/20",
    warning: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30"
  };

  return (
    <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 border ${colorStyles[color] || colorStyles.primary}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500">{trend}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
