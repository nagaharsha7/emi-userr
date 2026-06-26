import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { loanService } from "../services/loanService";
import PaymentTable from "../components/PaymentTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter, ArrowUpDown, Download, History } from "lucide-react";

const PaymentHistory = () => {
  const { currentUser, addToast } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc"); // 'dateDesc' | 'dateAsc' | 'amountDesc' | 'amountAsc'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both loans and payments concurrently
        const [loansData, paymentsData] = await Promise.all([
          loanService.getLoans(currentUser.uid),
          loanService.getPayments(currentUser.uid)
        ]);
        setLoans(loansData);
        setPayments(paymentsData);
      } catch (err) {
        addToast("Failed to fetch payment history: " + err.message, "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.uid]);

  // Resolve loan name by loanId helper
  const getLoanName = (loanId) => {
    const loan = loans.find((l) => l.loanId === loanId);
    return loan ? loan.loanName : "Unknown Loan";
  };

  // Filter and sort computation
  const filteredPayments = payments
    .filter((payment) => {
      const loanName = getLoanName(payment.loanId);
      const matchSearch = loanName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchMethod = 
        methodFilter === "all" || 
        (payment.method && payment.method.toLowerCase() === methodFilter.toLowerCase());

      return matchSearch && matchMethod;
    })
    .sort((a, b) => {
      if (sortBy === "dateDesc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "dateAsc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amountDesc") return b.amount - a.amount;
      if (sortBy === "amountAsc") return a.amount - b.amount;
      return 0;
    });

  // Export to CSV Functionality
  const handleDownloadCSV = () => {
    if (filteredPayments.length === 0) {
      addToast("No payments to export", "danger");
      return;
    }

    try {
      // CSV Headers
      const headers = ["Payment ID", "Date", "Time", "Loan Name", "Amount (INR)", "Payment Method", "Status"];
      
      // CSV Rows
      const rows = filteredPayments.map((payment) => {
        const dateObj = new Date(payment.date);
        const dateStr = dateObj.toLocaleDateString("en-IN");
        const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const loanName = getLoanName(payment.loanId);
        
        return [
          payment.paymentId,
          dateStr,
          timeStr,
          `"${loanName.replace(/"/g, '""')}"`, // escape double quotes
          payment.amount,
          payment.method || "UPI",
          "Success"
        ];
      });

      // Combine headers and rows
      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `paytrack_payment_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      
      addToast("CSV exported and downloaded successfully!", "success");
    } catch (err) {
      addToast("Failed to export CSV: " + err.message, "danger");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Payment History
          </h2>
          <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">
            View transaction details and download financial records for your tax returns
          </p>
        </div>
        
        {payments.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4.5 w-4.5" />
            Download CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : payments.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center dark:bg-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-4 dark:bg-slate-700 dark:text-slate-500">
            <History className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Payment Records</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 dark:text-slate-400">
            You haven't made any payments yet. Repayments will show up in this ledger.
          </p>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl border border-gray-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 backdrop-blur-sm">
            {/* Search input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by loan name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Filter Method */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Filter className="h-4.5 w-4.5" />
              </span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="all">All Payment Methods</option>
                <option value="upi">UPI</option>
                <option value="net banking">Net Banking</option>
                <option value="debit card">Debit Card</option>
                <option value="credit card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <ArrowUpDown className="h-4.5 w-4.5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="dateDesc">Date: Newest First</option>
                <option value="dateAsc">Date: Oldest First</option>
                <option value="amountDesc">Amount: High to Low</option>
                <option value="amountAsc">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Payment List Table */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Transaction Logs</h3>
            <PaymentTable payments={filteredPayments} loans={loans} />
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistory;
