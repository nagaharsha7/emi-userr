import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft, HelpCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background-light dark:bg-background-dark px-4 text-center">
      <div className="glass rounded-3xl p-8 max-w-md w-full dark:bg-slate-800 shadow-xl animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark mb-6">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200 mt-4">Page Not Found</h3>
        <p className="text-sm text-gray-400 mt-2 dark:text-slate-400 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another section.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-md transition-all hover:scale-102"
        >
          <MoveLeft className="h-4.5 w-4.5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
