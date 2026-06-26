import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loanService } from "../services/loanService";
import LoadingSpinner from "../components/LoadingSpinner";
import { FilePlus2, DollarSign, Calendar, Landmark, Info, FileText } from "lucide-react";

const AddLoan = () => {
  const { currentUser, addToast } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [loanName, setLoanName] = useState("");
  const [lender, setLender] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [purchasedProduct, setPurchasedProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Automatic duration calculation
  React.useEffect(() => {
    const P = Number(loanAmount);
    const I = Number(interestRate);
    const E = Number(emiAmount);

    if (P > 0 && E > 0 && I >= 0) {
      if (I === 0) {
        setDuration(Math.ceil(P / E).toString());
      } else {
        const r = I / 1200; // Monthly interest rate
        const monthlyInterest = P * r;
        
        if (E > monthlyInterest) {
          const val = E / (E - monthlyInterest);
          const calculatedMonths = Math.ceil(Math.log(val) / Math.log(1 + r));
          setDuration(calculatedMonths.toString());
        } else {
          setDuration("Infinite (EMI too low)");
        }
      }
    } else {
      setDuration("");
    }
  }, [loanAmount, interestRate, emiAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!loanName || !lender || !loanAmount || !emiAmount || !interestRate || !duration || !startDate) {
      addToast("Please fill in all required fields", "danger");
      return;
    }

    const numDuration = Number(duration);
    if (Number(loanAmount) <= 0 || Number(emiAmount) <= 0 || Number(interestRate) < 0 || isNaN(numDuration) || numDuration <= 0) {
      addToast("Values must be positive numbers. Please adjust loan specifications to ensure a valid duration.", "danger");
      return;
    }

    if (Number(emiAmount) > Number(loanAmount)) {
      addToast("EMI Amount cannot be greater than the Loan Amount", "danger");
      return;
    }

    try {
      setSubmitting(true);
      await loanService.addLoan(currentUser.uid, {
        loanName,
        lender,
        loanAmount,
        emiAmount,
        interestRate,
        duration,
        startDate,
        purchasedProduct,
        notes
      });
      addToast("Loan added successfully!", "success");
      navigate("/loans");
    } catch (err) {
      addToast(err.message || "Failed to add loan", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Loan</h2>
        <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Record a new active loan to begin tracking EMI cycles and repayments</p>
      </div>

      <div className="glass rounded-2xl p-6 dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Info Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Loan Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Gym Loan Category *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FilePlus2 className="h-4.5 w-4.5" />
                </span>
                <select
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white cursor-pointer font-semibold"
                  required
                >
                  <option value="">-- Choose Gym Loan Category --</option>
                  <option value="Cardio Equipment Loan">Cardio Equipment Loan</option>
                  <option value="Strength Training Equipment Loan">Strength Training Equipment Loan</option>
                  <option value="Free Weights & Racks Loan">Free Weights & Racks Loan</option>
                  <option value="CrossFit & Rig Setup Loan">CrossFit & Rig Setup Loan</option>
                  <option value="Full Commercial Gym Setup Loan">Full Commercial Gym Setup Loan</option>
                </select>
              </div>
            </div>

            {/* Lender Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lender Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Landmark className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  placeholder="e.g. FitTech Finance, GymLend"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Loan Principal Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Loan Amount (INR) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <DollarSign className="h-4.5 w-4.5" />
                </span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Monthly EMI Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Monthly EMI Amount *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <DollarSign className="h-4.5 w-4.5" />
                </span>
                <input
                  type="number"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Interest Rate (% p.a.) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 font-semibold text-sm">
                  %
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 8.75"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Loan Duration in Months */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Loan Duration (Months) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={duration}
                  placeholder="Calculated automatically"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-gray-100/60 dark:bg-slate-950/40 text-sm outline-none transition-all dark:border-slate-700 dark:text-slate-400 font-bold select-none cursor-not-allowed"
                  readOnly
                  required
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Start Date *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex gap-2 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                By default, the remaining principal balance will be initialized to the full loan amount. Each paid EMI installment will reduce this balance.
              </p>
            </div>
          </div>

          {/* Product Purchased */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Product / Asset Purchased *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Landmark className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={purchasedProduct}
                onChange={(e) => setPurchasedProduct(e.target.value)}
                placeholder="e.g. Treadmill, Squat Rack, Dumbbell Set"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Additional Notes</label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-gray-400">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or references about processing fees, guarantees, etc."
                rows="3"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-700/55">
            <button
              type="button"
              onClick={() => navigate("/loans")}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-all hover:scale-101 disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                "Save Loan"
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default AddLoan;
