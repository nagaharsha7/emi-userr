import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { Mail, Lock, LogIn, Wallet } from "lucide-react";

const Login = () => {
  const { login, forgotPassword, addToast, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("paytrack_remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all fields", "danger");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem("paytrack_remembered_email", email);
      } else {
        localStorage.removeItem("paytrack_remembered_email");
      }
      
      addToast("Successfully logged in", "success");
      navigate("/dashboard");
    } catch (err) {
      addToast(err.message || "Failed to log in", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      addToast("Please enter your email address to reset password", "danger");
      return;
    }

    try {
      setResetting(true);
      await forgotPassword(email);
      addToast("Password reset link sent to your email", "success");
    } catch (err) {
      addToast(err.message || "Failed to send reset link", "danger");
    } finally {
      setResetting(false);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-400 mt-1 dark:text-slate-400">Log in to track and manage your EMIs</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetting}
                className="text-xs font-semibold text-primary hover:text-primary-hover dark:text-blue-400 outline-none disabled:opacity-50"
              >
                {resetting ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary outline-none"
              />
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Remember login info</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-101 active:scale-99 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-slate-500">
          New to PayTrack?{" "}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-hover dark:text-blue-400">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
