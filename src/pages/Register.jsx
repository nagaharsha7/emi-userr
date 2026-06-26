import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Mail, Lock, Phone, UserPlus, Wallet } from "lucide-react";

const Register = () => {
  const { register, addToast, currentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validations
    if (!name || !email || !mobile || !password || !confirmPassword) {
      addToast("Please fill in all fields", "danger");
      return;
    }

    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "danger");
      return;
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "danger");
      return;
    }

    // Basic mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      addToast("Please enter a valid 10-digit mobile number", "danger");
      return;
    }

    try {
      setSubmitting(true);
      await register(email, password, name, mobile);
      addToast("Account registered successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      addToast(err.message || "Failed to create account", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background-light dark:bg-background-dark px-4 py-12">
      <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-xl dark:bg-slate-800 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 mb-4">
            <Wallet className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-sm text-gray-400 mt-1 dark:text-slate-400">Join PayTrack to track and optimize your repayments</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Mobile Number field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Password (min. 6 chars)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-101 active:scale-99 disabled:opacity-50 disabled:hover:scale-100 mt-2"
          >
            {submitting ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Register
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover dark:text-blue-400">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
