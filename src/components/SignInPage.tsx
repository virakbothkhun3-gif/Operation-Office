import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  LogIn, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Users 
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_STAFF_USERS } from '../utils/storage';

interface SignInPageProps {
  onSignIn: (user: UserProfile) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignIn }) => {
  const [tab, setTab] = useState<'quick' | 'custom'>('quick');

  // Custom Sign In State
  const [customName, setCustomName] = useState('');
  const [customStaffId, setCustomStaffId] = useState('');
  const [customRole, setCustomRole] = useState<UserProfile['role']>('Lead Integration Engineer');
  const [customDepartment, setCustomDepartment] = useState('Merchant POS Integration');
  const [pin, setPin] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customStaffId.trim()) {
      setErrorMsg('Please enter your full staff name and staff ID.');
      return;
    }

    const initials = customName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newUser: UserProfile = {
      id: `USR-${customStaffId.trim()}`,
      name: customName.trim(),
      staffId: customStaffId.trim(),
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@pos-integration.com`,
      role: customRole,
      avatarInitials: initials || 'ST',
      department: customDepartment,
      lastLoginAt: new Date().toISOString(),
    };

    onSignIn(newUser);
  };

  const handleQuickSignIn = (user: UserProfile) => {
    onSignIn(user);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#f0f0f2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Header Monogram */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div 
          className="mx-auto w-12 h-12 bg-[#f0f0f2] text-[#0f0f11] font-display flex items-center justify-center rounded text-xl font-bold shadow-md mb-4"
        >
          SI
        </div>

        <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.05em] text-[#f0f0f2]">
          Operations Dashboard
        </h1>
        <p className="mt-1 text-xs font-mono text-[rgba(240,240,242,0.5)]">
          System Integration & Merchant Tracking / Auth Gate
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-[#19191d] py-8 px-6 sm:px-10 shadow-2xl border border-[rgba(240,240,242,0.08)] rounded-xl space-y-6">
          {/* Sign In Mode Tabs */}
          <div className="flex border-b border-[rgba(240,240,242,0.08)] pb-2 gap-4">
            <button
              type="button"
              onClick={() => setTab('quick')}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === 'quick'
                  ? 'border-[#2ecc71] text-[#2ecc71]'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Select Staff Profile (1-Click)</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('custom')}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === 'custom'
                  ? 'border-[#2ecc71] text-[#2ecc71]'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Custom Staff / Guest Sign In</span>
            </button>
          </div>

          {/* Quick Staff Sign In */}
          {tab === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[rgba(240,240,242,0.5)]">
                  SELECT YOUR PROFILE TO SIGN IN:
                </span>
                <span className="text-[11px] font-mono text-[#2ecc71] bg-[#2ecc71]/10 px-2 py-0.5 rounded border border-[#2ecc71]/20">
                  READY
                </span>
              </div>

              <div className="space-y-2.5">
                {DEFAULT_STAFF_USERS.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleQuickSignIn(user)}
                    className="p-3.5 rounded-lg border border-[rgba(240,240,242,0.08)] bg-[#0f0f11]/60 hover:border-[#2ecc71]/60 hover:bg-[#0f0f11] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded bg-[#19191d] border border-[rgba(240,240,242,0.12)] font-display text-[#f0f0f2] flex items-center justify-center font-bold text-sm shadow-xs"
                      >
                        {user.avatarInitials}
                      </div>

                      <div className="text-left">
                        <div className="text-xs font-semibold text-[#f0f0f2] group-hover:text-[#2ecc71] transition-colors flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="font-mono text-[10px] text-[rgba(240,240,242,0.4)]">ID: {user.staffId}</span>
                        </div>
                        <div className="text-[11px] text-[rgba(240,240,242,0.5)]">
                          {user.role} · {user.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[rgba(240,240,242,0.4)] group-hover:text-[#2ecc71] transition-colors">
                      <span className="text-xs font-semibold hidden sm:inline">Sign In</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sign In */}
          {tab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                    Full Staff Name <span className="text-[#e74c3c]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nget Monioudom"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                    Staff ID <span className="text-[#e74c3c]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 222222"
                    value={customStaffId}
                    onChange={(e) => setCustomStaffId(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Access Security PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-3 text-[rgba(240,240,242,0.4)]" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-action-primary py-2.5 font-semibold text-xs flex items-center justify-center gap-2 mt-4"
              >
                <LogIn className="w-4 h-4" />
                <span>Authorize & Enter Dashboard</span>
              </button>
            </form>
          )}

          {/* Security footnote */}
          <div className="pt-2 text-center text-[10px] font-mono text-[rgba(240,240,242,0.4)] flex items-center justify-center gap-1.5 border-t border-[rgba(240,240,242,0.06)]">
            <Shield className="w-3 h-3 text-[#2ecc71]" />
            <span>ROLE-BASED AUDIT ACTIVE · ISO/IEC 27001 SECURE DESK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
