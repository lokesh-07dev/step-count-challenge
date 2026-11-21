import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Footprints, Trophy, Users, LayoutDashboard, Smartphone } from "lucide-react";
import { APP_NAME } from "@stepora/shared";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Challenges", path: "/challenges", icon: Trophy },
    { label: "Groups", path: "/groups", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-brand-500/20">
            <Footprints className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-brand-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 text-emerald-400 text-xs font-medium">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile Synced</span>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-brand-500/20"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
};
