import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  LayoutDashboard,
  Compass,
  FilePlus2,
  Sparkles,
  Users2,
  BarChart3,
  ShieldCheck,
  BookOpen,
  PlayCircle,
  RotateCcw,
  Menu,
  X,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { role, setRole, userName } = useAuth();
  const { loadScenario, resetDemo, isLoading } = useDemo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: BookOpen },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Incidents', icon: Compass },
    { id: 'submit', label: 'Submit Report', icon: FilePlus2 },
    { id: 'analysis', label: 'AI Interpreter', icon: Sparkles },
    { id: 'coordination', label: 'Coordination', icon: Users2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Review Panel', icon: ShieldCheck },
    { id: 'about', label: 'Methodology', icon: BookOpen },
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  return (
    <nav className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base font-sans">
                  ResQNet<span className="text-cyan-400">.AI</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-mono text-slate-400 block -mt-0.5">
                Community Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action: Role Selector & Demo Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Quick Demo Reset & Load */}
            <button
              onClick={loadScenario}
              disabled={isLoading}
              title="Load complete 7-step hackathon simulation"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition-all active:scale-95 disabled:opacity-50"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Load Demo</span>
            </button>

            <button
              onClick={resetDemo}
              disabled={isLoading}
              title="Reset system to clean baseline"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Persona Switcher */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={role}
                onChange={handleRoleChange}
                className="bg-navy-900 border border-slate-700 text-slate-200 text-xs rounded-lg py-1 px-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="CITIZEN">Citizen (Reporter)</option>
                <option value="REVIEWER">Reviewer (Triage EMT)</option>
                <option value="COORDINATOR">Coordinator (Dispatch)</option>
                <option value="ADMIN">Admin (Director Chen)</option>
              </select>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={loadScenario}
              disabled={isLoading}
              className="px-2 py-1 rounded bg-cyan-600 text-white text-xs font-medium"
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-navy-950 border-b border-slate-800">
          <div className="py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Persona:</span>
            <select
              value={role}
              onChange={handleRoleChange}
              className="bg-navy-900 border border-slate-700 text-slate-200 text-xs rounded py-1 px-2"
            >
              <option value="CITIZEN">Citizen (Reporter)</option>
              <option value="REVIEWER">Reviewer (Triage EMT)</option>
              <option value="COORDINATOR">Coordinator (Dispatch)</option>
              <option value="ADMIN">Admin (Director Chen)</option>
            </select>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
