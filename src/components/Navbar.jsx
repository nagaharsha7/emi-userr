import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Sun, Moon, LogOut, User, Wallet } from "lucide-react";

const Navbar = ({ onMenuToggle }) => {
  const { currentUser, logout, addToast } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Successfully logged out", "success");
      navigate("/login");
    } catch (error) {
      addToast("Failed to log out: " + error.message, "danger");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 dark:border-gray-800/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Logo and Mobile Drawer Button */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onMenuToggle}
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 md:hidden dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary dark:text-primary-dark">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
              PayTrack
            </span>
          </Link>
        </div>

        {/* Right Side: Options & User Menu */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {/* User Account Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary-dark">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden text-sm md:block">
                  <p className="font-semibold leading-none text-gray-800 dark:text-slate-200">
                    {currentUser.name}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-20 dark:border-slate-800 dark:bg-slate-800">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                      <p className="text-xs text-gray-400 dark:text-slate-500">Logged in as</p>
                      <p className="text-sm font-semibold truncate text-gray-700 dark:text-slate-300">{currentUser.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 text-gray-700 hover:text-primary transition-colors dark:text-slate-300 dark:hover:text-primary-dark"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
