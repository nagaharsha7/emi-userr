import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loanService } from "../services/loanService";
import ProgressBar from "../components/ProgressBar";
import PaymentTable from "../components/PaymentTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  PlusCircle, 
  Award, 
  Percent,
  Clock,
  Notebook
} from "lucide-react";

const LoanDetails = () => {
  const { loanId } = useParams();
  const { currentUser, addToast } = useAuth();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay EMI Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const loanData = await loanService.getLoanDetails(loanId);
      if (!loanData || loanData.userId !== currentUser.uid) {
        addToast("Loan record not found", "danger");
        navigate("/loans");
        return;
      }
      
      const paymentsData = await loanService.getPayments(currentUser.uid, loanId);
      setLoan(loanData);
      setPayments(paymentsData);
      
      // Default payment amount to EMI amount or remaining amount (whichever is smaller)
      setPayAmount(Math.min(loanData.emiAmount, loanData.remainingAmount).toString());
    } catch (err) {
      addToast("Failed to fetch loan details: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loanId, currentUser.uid]);

  // Next EMI Date helper
  const getNextEmiDate = (startDateStr, paidCount) => {
    if (!startDateStr) return "-";
    const date = new Date(startDateStr);
    
    // Standard bank logic: 1st EMI due 1 month after start, 2nd 2 months after...
    date.setMonth(date.getMonth() + paidCount + 1);
    
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePayEmiSubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      addToast("Please enter a valid amount", "danger");
      return;
    }

    if (Number(payAmount) > loan.remainingAmount) {
      addToast("Amount exceeds remaining outstanding balance", "danger");
      return;
    }

    try {
      setPaying(true);
      const { newRemaining, newStatus } = await loanService.payEmi(
        loanId,
        currentUser.uid,
        payAmount,
        payMethod
      );
      
      addToast(`Payment of ${formatCurrency(payAmount)} successful!`, "success");
      setPayModalOpen(false);
      
      // Refresh local page state
      await fetchData();
    } catch (err) {
      addToast("Payment failed: " + err.message, "danger");
    } finally {
      setPaying(false);
    }
  };

  if (loading && !loan) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!loan) return null;

  const totalPaid = loan.loanAmount - loan.remainingAmount;
  const progressPercent = loan.loanAmount > 0 ? (totalPaid / loan.loanAmount) * 100 : 0;
  const isCompleted = loan.status === "completed" || loan.remainingAmount <= 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/loans"
            className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-150 transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {loan.loanName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Lender: {loan.lender}</p>
          </div>
        </div>

        {/* PAY EMI / Completed badge CTA */}
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-green-50 px-5 py-3 text-xs font-bold text-green-700 border border-green-200 dark:bg-green-955/30 dark:border-green-900/35 dark:text-green-400">
            <Award className="h-5 w-5" />
            Loan Fully Settled
          </span>
        ) : loan.status === "pending" ? (
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 px-5 py-3 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-955/30 dark:border-amber-900/35 dark:text-amber-400 animate-pulse">
            Pending Admin Approval
          </span>
        ) : (
          <button
            onClick={() => setPayModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/10 transition-all hover:scale-102"
          >
            <DollarSign className="h-4.5 w-4.5" />
            PAY EMI
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Principal */}
        <div className="glass rounded-2xl p-5 dark:bg-slate-800">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Principal</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1 dark:text-white">{formatCurrency(loan.loanAmount)}</p>
        </div>

        {/* Paid Amount */}
        <div className="glass rounded-2xl p-5 dark:bg-slate-800">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Repaid</p>
          <p className="text-xl font-extrabold text-green-600 mt-1 dark:text-green-400">{formatCurrency(totalPaid)}</p>
        </div>

        {/* Remaining */}
        <div className="glass rounded-2xl p-5 dark:bg-slate-800">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Outstanding Balance</p>
          <p className={`text-xl font-extrabold mt-1 ${isCompleted ? "text-success" : "text-gray-900 dark:text-white"}`}>
            {isCompleted ? "Settled" : formatCurrency(loan.remainingAmount)}
          </p>
        </div>

        {/* Next due date */}
        <div className="glass rounded-2xl p-5 dark:bg-slate-800">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Next Due Date</p>
          <p className="text-sm font-bold text-gray-900 mt-1.5 flex items-center gap-1.5 dark:text-white">
            <Clock className="h-4.5 w-4.5 text-gray-400" />
            {isCompleted ? "None (Closed)" : getNextEmiDate(loan.startDate, payments.length)}
          </p>
        </div>
      </div>

      {/* Main Details and Progress */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: General info */}
        <div className="md:col-span-1 glass rounded-2xl p-6 dark:bg-slate-800 space-y-6">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">
            Loan Specifications
          </h4>
          
          <div className="space-y-4 text-xs">
            {/* Purchased Product */}
            {loan.purchasedProduct && (
              <div className="flex justify-between items-center pb-2 border-b border-gray-50/50 dark:border-slate-800">
                <span className="text-gray-400 flex items-center gap-1.5"><Landmark className="h-4 w-4" /> Product Purchased</span>
                <span className="font-bold text-primary dark:text-primary-dark">{loan.purchasedProduct}</span>
              </div>
            )}

            {/* Interest */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5"><Percent className="h-4 w-4" /> Interest Rate</span>
              <span className="font-bold text-gray-800 dark:text-slate-200">{loan.interestRate}% p.a.</span>
            </div>
            
            {/* Duration */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Duration</span>
              <span className="font-bold text-gray-800 dark:text-slate-200">{loan.duration} Months</span>
            </div>

            {/* Start Date */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Start Date</span>
              <span className="font-bold text-gray-800 dark:text-slate-200">{loan.startDate}</span>
            </div>

            {/* Paid EMIs */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Installments Paid</span>
              <span className="font-bold text-gray-800 dark:text-slate-200">{payments.length} / {loan.duration}</span>
            </div>
          </div>

          {/* Notes section */}
          {loan.notes && (
            <div className="pt-4 border-t border-gray-105 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><Notebook className="h-4 w-4" /> Notes</span>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed dark:text-slate-400 whitespace-pre-line">
                {loan.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Payment Logs & Progress */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="glass rounded-2xl p-6 dark:bg-slate-800">
            <ProgressBar percentage={progressPercent} size="lg" showLabel={true} />
          </div>

          {/* Payment Logs */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Repayment Logs</h3>
            <PaymentTable payments={payments} loans={[loan]} />
          </div>
        </div>
      </div>

      {/* Pay EMI Dialog Modal Drawer */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setPayModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          <div className="glass rounded-3xl p-8 max-w-md w-full dark:bg-slate-800 relative z-10 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Record Repayment</h3>
            <p className="text-xs text-gray-500 mb-6 dark:text-slate-400">Confirm payment details to update the loan status</p>
            
            <form onSubmit={handlePayEmiSubmit} className="space-y-4">
              {/* Payment Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Payment Amount (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={loan.remainingAmount}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-250 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-250 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-medium"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/10 transition-all hover:scale-101 disabled:opacity-50"
                >
                  {paying ? <LoadingSpinner size="sm" color="white" /> : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
