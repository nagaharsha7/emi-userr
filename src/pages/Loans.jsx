import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loanService } from "../services/loanService";
import LoanCard from "../components/LoanCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter, ArrowUpDown, PlusCircle, CreditCard } from "lucide-react";

const Loans = () => {
  const { currentUser, addToast } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and Sort states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [sortBy, setSortBy] = useState("dateDesc"); // 'dateDesc' | 'amountDesc' | 'remainingDesc' | 'nameAsc'

  // Fetch loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const data = await loanService.getLoans(currentUser.uid);
        setLoans(data);
      } catch (err) {
        addToast("Failed to fetch loans: " + err.message, "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [currentUser.uid]);

  // Filter and sort computation
  const processedLoans = loans
    .filter((loan) => {
      const matchSearch =
        loan.loanName.toLowerCase().includes(search.toLowerCase()) ||
        loan.lender.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus =
        statusFilter === "all" || loan.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.startDate) - new Date(a.startDate);
      }
      if (sortBy === "amountDesc") {
        return b.loanAmount - a.loanAmount;
      }
      if (sortBy === "remainingDesc") {
        return b.remainingAmount - a.remainingAmount;
      }
      if (sortBy === "nameAsc") {
        return a.loanName.localeCompare(b.loanName);
      }
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Loans</h2>
          <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">
            View, search, and manage all your active and closed credit timelines
          </p>
        </div>
        <Link
          to="/add-loan"
          className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-all hover:scale-101 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Take Loan
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : loans.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center dark:bg-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 dark:bg-primary/20 dark:text-primary-dark">
            <CreditCard className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Loans Registered</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 dark:text-slate-400">
            It looks like you don't have any active loans assigned to your account yet. Start by recording a new active loan profile.
          </p>
          <Link
            to="/add-loan"
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-102"
          >
            <PlusCircle className="h-4 w-4" />
            Take Loan
          </Link>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl border border-gray-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 backdrop-blur-sm">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search loan or lender..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Filter className="h-4.5 w-4.5" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="all">All Loan Statuses</option>
                <option value="active">Active Loans</option>
                <option value="completed">Completed Loans</option>
              </select>
            </div>

            {/* Sort options */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <ArrowUpDown className="h-4.5 w-4.5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="dateDesc">Start Date (Newest)</option>
                <option value="amountDesc">Principal (High to Low)</option>
                <option value="remainingDesc">Remaining (High to Low)</option>
                <option value="nameAsc">Loan Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Loans Grid */}
          {processedLoans.length === 0 ? (
            <div className="text-center py-12 text-gray-450 dark:text-slate-500 text-sm font-medium">
              No loans matching your search filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {processedLoans.map((loan) => (
                <LoanCard key={loan.loanId} loan={loan} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Loans;
