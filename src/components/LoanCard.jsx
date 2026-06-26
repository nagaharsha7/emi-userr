import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Building, Landmark, ChevronRight, Award } from "lucide-react";
import ProgressBar from "./ProgressBar";

const LoanCard = ({ loan }) => {
  const {
    loanId,
    loanName,
    lender,
    loanAmount,
    emiAmount,
    remainingAmount,
    status,
    startDate
  } = loan;

  // Calculate repayment progress percentage
  const totalPaid = loanAmount - remainingAmount;
  const progressPercent = loanAmount > 0 ? (totalPaid / loanAmount) * 100 : 0;
  const isCompleted = status === "completed" || remainingAmount <= 0;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={`glass relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-slate-800 ${
      isCompleted 
        ? "border-green-200/50 bg-gradient-to-br from-green-50/40 via-white to-white dark:from-green-950/10 dark:border-green-900/30" 
        : ""
    }`}>
      {/* Decorative Gradient Background Glow for premium look */}
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-3xl opacity-20 transition-all ${
        isCompleted ? "bg-green-500" : "bg-primary"
      }`} />

      {/* Header: Title & Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
            {loanName}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-slate-400">
            <Building className="h-3.5 w-3.5" />
            <span>{lender}</span>
          </div>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50">
            <Award className="h-3.5 w-3.5" />
            Completed
          </span>
        ) : status === "pending" ? (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/50 animate-pulse">
            Pending Approval
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
            Active
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">EMI Amount</p>
          <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
            {formatCurrency(emiAmount)}
            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">/mo</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Remaining</p>
          <p className={`text-base font-bold mt-0.5 ${isCompleted ? "text-success" : "text-gray-900 dark:text-white"}`}>
            {isCompleted ? "Fully Paid" : formatCurrency(remainingAmount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Loan Principal</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-0.5">
            {formatCurrency(loanAmount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Start Date</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {new Date(startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Progress Bar Component */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
        <ProgressBar percentage={progressPercent} size="md" showLabel={true} />
      </div>

      {/* Footer Link to Details */}
      <Link
        to={`/loans/${loanId}`}
        className="mt-5 flex items-center justify-between w-full rounded-xl bg-gray-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-dark transition-all border border-gray-100 dark:border-slate-700/30 group"
      >
        <span>Manage & View Repayments</span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
};

export default LoanCard;
