import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loanService } from "../services/loanService";
import DashboardCard from "../components/DashboardCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Coins, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Wallet,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

const Dashboard = () => {
  const { currentUser, addToast } = useAuth();
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [loansData, paymentsData] = await Promise.all([
          loanService.getLoans(currentUser.uid),
          loanService.getPayments(currentUser.uid)
        ]);
        setLoans(loansData);
        setPayments(paymentsData);
      } catch (err) {
        addToast("Failed to fetch dashboard data: " + err.message, "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.uid]);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations for Summary Cards
  const totalLoans = loans.length;
  const activeLoans = loans.filter((l) => l.status === "active");
  const activeLoansCount = activeLoans.length;

  const totalPendingAmount = loans.filter((l) => l.status === "active").reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalPaidAmount = loans.filter((l) => l.status !== "pending").reduce((acc, curr) => acc + (curr.loanAmount - curr.remainingAmount), 0);

  // EMI Scheduling Logic (Reminders)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEmis = [];
  const upcomingEmis = [];
  const overdueEmis = [];

  activeLoans.forEach((loan) => {
    const loanPayments = payments.filter((p) => p.loanId === loan.loanId);
    const paidCount = loanPayments.length;

    // Calculate next due date
    const nextDueDate = new Date(loan.startDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + paidCount + 1);
    nextDueDate.setHours(0, 0, 0, 0);

    const diffTime = nextDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const emiDetails = {
      loan,
      nextDueDate: nextDueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      diffDays
    };

    if (diffDays === 0) {
      todayEmis.push(emiDetails);
    } else if (diffDays < 0) {
      overdueEmis.push(emiDetails);
    } else if (diffDays > 0 && diffDays <= 15) {
      upcomingEmis.push(emiDetails);
    }
  });

  // Chart 1 Data: Loan Progress (Stacked Bar)
  const progressChartData = loans.map((l) => ({
    name: l.loanName.length > 12 ? l.loanName.substring(0, 12) + "..." : l.loanName,
    Paid: l.loanAmount - l.remainingAmount,
    Remaining: l.remainingAmount
  }));

  // Chart 2 Data: Monthly Payment Trend (Area Chart)
  // pre-populate last 6 calendar months
  const monthlySums = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    monthlySums[monthLabel] = 0;
  }

  payments.forEach((p) => {
    const monthLabel = new Date(p.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    if (monthlySums[monthLabel] !== undefined) {
      monthlySums[monthLabel] += p.amount;
    }
  });

  const paymentTrendData = Object.keys(monthlySums).map((month) => ({
    month,
    Amount: monthlySums[month]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      
      {/* Greetings Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Hi, {currentUser?.name || "User"} <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">
            Here's the summary of your loan repayments and financial liabilities.
          </p>
        </div>
        <Link
          to="/add-loan"
          className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-all hover:scale-101 shrink-0"
        >
          Take Loan
        </Link>
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Loans" 
          value={totalLoans} 
          icon={Coins} 
          color="primary" 
          trend={`${activeLoansCount} Active`} 
        />
        <DashboardCard 
          title="Active Loans" 
          value={activeLoansCount} 
          icon={TrendingUp} 
          color="warning" 
          trend="Outstanding schedules" 
        />
        <DashboardCard 
          title="Pending Amount" 
          value={formatCurrency(totalPendingAmount)} 
          icon={AlertCircle} 
          color="danger" 
          trend="Total remaining liability" 
        />
        <DashboardCard 
          title="Total Paid Amount" 
          value={formatCurrency(totalPaidAmount)} 
          icon={CheckCircle} 
          color="success" 
          trend="Successfully returned capital" 
        />
      </div>

      {/* Reminders / Due System Structure */}
      {(todayEmis.length > 0 || overdueEmis.length > 0 || upcomingEmis.length > 0) ? (
        <div className="glass rounded-2xl p-6 dark:bg-slate-800 border-amber-200/50 bg-gradient-to-br from-amber-50/10 via-white to-white dark:from-amber-950/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">EMI Reminders & Schedules</h4>
          </div>

          <div className="space-y-3">
            {/* Overdue EMIs */}
            {overdueEmis.map(({ loan, nextDueDate, diffDays }) => (
              <div 
                key={loan.loanId} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">{loan.loanName} EMI Overdue</p>
                  <p className="text-[10px] opacity-75">
                    Due Date was: {nextDueDate} ({Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? "day" : "days"} ago)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">{formatCurrency(loan.emiAmount)}</span>
                  <Link 
                    to={`/loans/${loan.loanId}`}
                    className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-[10px] font-bold text-white transition-all"
                  >
                    Pay Now
                  </Link>
                </div>
              </div>
            ))}

            {/* Today EMIs */}
            {todayEmis.map(({ loan, nextDueDate }) => (
              <div 
                key={loan.loanId} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 dark:bg-amber-955/20 dark:border-amber-900/30 dark:text-amber-300"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">{loan.loanName} EMI is Due Today!</p>
                  <p className="text-[10px] opacity-75">Installment date: {nextDueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">{formatCurrency(loan.emiAmount)}</span>
                  <Link 
                    to={`/loans/${loan.loanId}`}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-[10px] font-bold text-white transition-all"
                  >
                    Pay Now
                  </Link>
                </div>
              </div>
            ))}

            {/* Upcoming EMIs */}
            {upcomingEmis.map(({ loan, nextDueDate, diffDays }) => (
              <div 
                key={loan.loanId} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-150 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Upcoming EMI: {loan.loanName}</p>
                  <p className="text-[10px] opacity-75">Due in {diffDays} {diffDays === 1 ? "day" : "days"} ({nextDueDate})</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">{formatCurrency(loan.emiAmount)}</span>
                  <Link 
                    to={`/loans/${loan.loanId}`}
                    className="flex items-center gap-1 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-[10px] font-bold text-white transition-all"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty Reminders Info Card */
        <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800 dark:bg-blue-950/10 dark:border-blue-900/20 dark:text-blue-300">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold">All EMI schedules up to date</h5>
            <p className="text-[10px] mt-0.5 opacity-80 leading-relaxed">
              No outstanding loan installments are overdue or due within the next 15 days. We will automatically alert you when repayment dates approach.
            </p>
          </div>
        </div>
      )}

      {/* Visual Recharts Layout */}
      {loans.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Chart 1: Loan Progress (Stacked Bar) */}
          <div className="glass rounded-2xl p-5 dark:bg-slate-800">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Loan Repayment Progress</h4>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Breakdown of principal paid vs remaining balance per loan</p>
            </div>
            
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Bar dataKey="Paid" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Remaining" stackId="a" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Payments Trend (Area Chart) */}
          <div className="glass rounded-2xl p-5 dark:bg-slate-800">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Cash Spend</h4>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Monthly payment outflow trends over the last 6 calendar months</p>
            </div>

            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={paymentTrendData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="Amount" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* Empty Dashboard Welcome Banner */
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center dark:bg-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 dark:bg-primary/20 dark:text-primary-dark">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Welcome to PayTrack</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 dark:text-slate-400">
            No loans are currently registered under your account. Register a new active credit profile to begin tracking.
          </p>
          <Link
            to="/add-loan"
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-102"
          >
            Take Loan
          </Link>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
