import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Footprints, Trophy, Users, LayoutDashboard, Smartphone, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "@stepora/shared";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Challenges", path: "/challenges", icon: Trophy },
    { label: "Groups", path: "/groups", icon: Users },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
            <span>Health Sync Active</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-brand-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
