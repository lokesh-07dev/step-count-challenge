import React from "react";
import { Footprints, Heart, Shield, Zap } from "lucide-react";
import { APP_NAME } from "@stepora/shared";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Footprints className="h-5 w-5" />
          </div>
          <span className="text-white font-semibold text-base">{APP_NAME} Platform</span>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs text-slate-500">Cross-Platform Step Count Challenge</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> End-to-end Verified Sync
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Health Connect & HealthKit
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-400" /> Active Community
          </span>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} {APP_NAME}. Production Foundation v1.0.0
        </p>
      </div>
    </footer>
  );
};
