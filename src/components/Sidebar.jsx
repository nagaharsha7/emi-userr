import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  PlusCircle, 
  History, 
  User, 
  X 
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Loans", path: "/loans", icon: CreditCard },
    { name: "Take Loan", path: "/add-loan", icon: PlusCircle },
    { name: "Payment History", path: "/payment-history", icon: History },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop/Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200/80 bg-white pt-16 transition-transform duration-300 md:translate-x-0 dark:border-slate-800/80 dark:bg-slate-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Details */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-primary dark:text-primary-dark">PayTrack Secure</p>
            <p className="text-[10px] text-gray-400 mt-0.5">End-to-End Encryption Enabled</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
