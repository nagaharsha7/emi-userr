import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Shield, TrendingUp, Bell, CheckCircle2, ChevronRight } from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center animate-fade-in">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary-dark mb-6">
          <Shield className="h-3.5 w-3.5" />
          Smart Financial Tracking
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight max-w-3xl leading-tight">
          Keep track of your{" "}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
            EMIs & Loans
          </span>{" "}
          effortlessly
        </h1>
        
        <p className="mt-6 text-lg text-gray-500 max-w-2xl dark:text-slate-400">
          The ultimate premium dashboard for users to organize lender schedules, monitor outstanding balances, pay mock/real installments, and visualize repayment timelines.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-102"
            >
              Go to Dashboard
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-102"
              >
                Get Started
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-semibold rounded-2xl shadow-sm transition-all"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="glass rounded-2xl p-8 dark:bg-slate-855 flex flex-col items-start transition-all hover:shadow-lg">
            <div className="rounded-xl p-3 bg-primary/10 text-primary mb-5 dark:bg-primary/20 dark:text-primary-dark">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Centralized Loan Vault</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Consolidate all housing, education, automobile, and personal credit terms into a clean timeline.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass rounded-2xl p-8 dark:bg-slate-855 flex flex-col items-start transition-all hover:shadow-lg">
            <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600 mb-5 dark:bg-emerald-500/20 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics & Visualizations</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Gain deep insight through charts showing your principal drop, monthly payments, and upcoming liabilities.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass rounded-2xl p-8 dark:bg-slate-855 flex flex-col items-start transition-all hover:shadow-lg">
            <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 mb-5 dark:bg-amber-500/20 dark:text-amber-400">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">EMI Reminders</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Never miss a due date again. Instantly see what is due today, what is upcoming, and any outstanding overdue amounts.
            </p>
          </div>
          
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-gray-50/50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800/60 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Engineered with modern capabilities
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-12">
            {["React Vite", "Tailwind CSS", "Firebase Auth", "Firestore DB", "Recharts"].map((tech) => (
              <div key={tech} className="flex items-center gap-2 font-medium text-gray-600 dark:text-slate-400 text-sm">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
