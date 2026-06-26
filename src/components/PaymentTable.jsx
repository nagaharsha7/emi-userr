import React, { useState } from "react";
import { ArrowUpDown, Calendar, HelpCircle, FileClock } from "lucide-react";

const PaymentTable = ({ payments, loans = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Find loan name by loanId helper
  const getLoanName = (loanId) => {
    const loan = loans.find((l) => l.loanId === loanId);
    return loan ? loan.loanName : "Unknown Loan";
  };

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (payments.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center flex flex-col items-center justify-center dark:bg-slate-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-4 dark:bg-slate-700 dark:text-slate-500">
          <FileClock className="h-8 w-8" />
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white">No repayments yet</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1 dark:text-slate-400">
          When you pay an EMI on your active loans, the payment transactions history will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-slate-400">Date & Time</th>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-slate-400">Loan Name</th>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-slate-400">Method</th>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-500 dark:text-slate-400">Amount Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {paginatedPayments.map((payment) => (
              <tr key={payment.paymentId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-slate-300">
                  {formatDate(payment.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-950 dark:text-white">
                  {getLoanName(payment.loanId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    {payment.method || "UPI"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                    Success
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="space-y-3.5 md:hidden">
        {paginatedPayments.map((payment) => (
          <div
            key={payment.paymentId}
            className="glass rounded-xl p-4 space-y-3 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-medium dark:text-slate-500">
                {formatDate(payment.date)}
              </span>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Success
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h5 className="font-bold text-sm text-gray-950 dark:text-white">
                  {getLoanName(payment.loanId)}
                </h5>
                <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 mt-1 dark:bg-slate-700 dark:text-slate-400">
                  {payment.method || "UPI"}
                </span>
              </div>
              <span className="font-extrabold text-base text-gray-950 dark:text-white">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, payments.length)}
            </span>{" "}
            of <span className="font-semibold text-gray-900 dark:text-white">{payments.length}</span> payments
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
