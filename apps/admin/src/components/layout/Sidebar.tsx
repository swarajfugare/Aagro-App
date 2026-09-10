import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Wheat,
  Boxes,
  ShoppingBag,
  PackageCheck,
  Navigation,
  Sparkles,
  TrendingUp,
  CloudSun,
  ShieldAlert,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const operationsItems = [
    { to: '/farmers', label: 'Farmers', icon: Users },
    { to: '/buyers', label: 'Buyers', icon: Building2 },
    { to: '/drivers', label: 'Drivers', icon: Truck },
    { to: '/crops', label: 'Crops Catalog', icon: Wheat },
    { to: '/supply', label: 'Supply Batches', icon: Boxes },
    { to: '/demand', label: 'Buyer Demand', icon: ShoppingBag },
    { to: '/orders', label: 'Orders Lifecycle', icon: PackageCheck },
    { to: '/trips', label: 'Logistics & Trips', icon: Navigation },
  ];

  const futureItems = [
    { label: 'Matching Engine', icon: Sparkles },
    { label: 'Market Prices', icon: TrendingUp },
    { label: 'Weather Advisory', icon: CloudSun },
    { label: 'Audit Trail', icon: ShieldAlert },
    { label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-surface-sidebar text-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-forest-950/80',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img src="/logo.svg" alt="KrishiSetu" className="w-9 h-9 rounded-lg" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              KrishiSetu
            </h1>
            <p className="text-[10px] text-amber-400 font-medium tracking-wide">
              From Farm to Market, Connected
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Section */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-forest-800 text-white font-semibold shadow-inner border border-white/10'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Operations Core */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Operations Center
            </p>
            <div className="space-y-1">
              {operationsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-forest-800 text-white font-semibold shadow-inner border border-white/10'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Upcoming Architecture Modules */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Planned Modules
            </p>
            <div className="space-y-1">
              {futureItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-500 cursor-not-allowed select-none opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="p-3.5 border-t border-white/10 bg-black/20 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Phase 4 Foundation</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v0.1.0</span>
        </div>
      </aside>
    </>
  );
};
