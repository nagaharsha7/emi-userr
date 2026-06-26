import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Phone, Mail, Lock, ShieldAlert, LogOut, Check } from "lucide-react";

const Profile = () => {
  const { currentUser, updateProfile, updatePassword, logout, addToast } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Security Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySubmitting, setSecuritySubmitting] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      addToast("Please fill in all profile fields", "danger");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      addToast("Please enter a valid 10-digit mobile number", "danger");
      return;
    }

    try {
      setProfileSubmitting(true);
      await updateProfile(currentUser.uid, { name, mobile });
      addToast("Profile details updated successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "danger");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      addToast("Please fill in both password fields", "danger");
      return;
    }

    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters", "danger");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "danger");
      return;
    }

    try {
      setSecuritySubmitting(true);
      await updatePassword(newPassword);
      addToast("Password updated successfully", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(err.message || "Failed to update password", "danger");
    } finally {
      setSecuritySubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Successfully logged out", "success");
      navigate("/login");
    } catch (err) {
      addToast("Failed to log out: " + err.message, "danger");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
          <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Manage your personal credentials, contact details, and security</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition-all dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out of Account
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Profile Card details */}
        <div className="glass rounded-2xl p-6 dark:bg-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-950 dark:text-white">Personal Details</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Update contact and display names</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450 dark:text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450 dark:text-slate-500">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 dark:text-slate-550 uppercase tracking-wider">Email (Not Editable)</label>
              <div className="relative opacity-65">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                />
              </div>
            </div>

            {/* Save details button */}
            <button
              type="submit"
              disabled={profileSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/10 transition-all hover:scale-101 disabled:opacity-50"
            >
              {profileSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Check className="h-4.5 w-4.5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / Password updates */}
        <div className="glass rounded-2xl p-6 dark:bg-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-950 dark:text-white">Security & Password</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Update account access credential</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex gap-2 p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Changing your password will require you to log in again with your new credentials on your next session.
              </p>
            </div>

            {/* Update password button */}
            <button
              type="submit"
              disabled={securitySubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/10 transition-all hover:scale-101 disabled:opacity-50"
            >
              {securitySubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Check className="h-4.5 w-4.5" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
