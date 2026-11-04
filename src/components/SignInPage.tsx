import React, { useState } from 'react';
import { 
  LogIn, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_STAFF_USERS } from '../utils/storage';

interface SignInPageProps {
  onSignIn: (user: UserProfile) => void;
  theme?: 'day' | 'night';
  onToggleTheme?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ 
  onSignIn, 
  theme = 'night', 
  onToggleTheme 
}) => {
  // Default to Nget Monioudom (222222)
  const defaultUser = DEFAULT_STAFF_USERS[0];
  
  const [staffName, setStaffName] = useState<string>(defaultUser.name);
  const [staffId, setStaffId] = useState<string>(defaultUser.staffId);
  const [role, setRole] = useState<UserProfile['role']>(defaultUser.role);
  const [department, setDepartment] = useState<string>(defaultUser.department);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // One-click quick login for staff chip
  const handleQuickClick = (user: UserProfile) => {
    onSignIn(user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffId.trim()) {
      setErrorMsg('Please enter both Staff Name and Staff ID.');
      return;
    }

    const matched = DEFAULT_STAFF_USERS.find(
      (u) => u.staffId.trim() === staffId.trim()
    );

    if (matched) {
      onSignIn({
        ...matched,
        name: staffName.trim(),
        staffId: staffId.trim(),
        lastLoginAt: new Date().toISOString(),
      });
      return;
    }

    const initials = staffName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST';

    const newUser: UserProfile = {
      id: `USR-${staffId.trim()}`,
      name: staffName.trim(),
      staffId: staffId.trim(),
      email: `${staffName.toLowerCase().replace(/\s+/g, '.')}@pos-integration.com`,
      role: role,
      avatarInitials: initials,
      department: department,
      lastLoginAt: new Date().toISOString(),
    };

    onSignIn(newUser);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#f0f0f2] flex flex-col justify-center items-center py-10 px-4 font-sans antialiased relative">
      {/* Top Right Theme Toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-[rgba(240,240,242,0.1)] bg-[#19191d] hover:bg-white/5 text-xs font-mono flex items-center gap-1.5 text-[rgba(240,240,242,0.8)] hover:text-[#f0f0f2] transition-colors"
            title={theme === 'night' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            aria-label="Toggle Theme"
          >
            {theme === 'night' ? (
              <>
                <Sun className="w-4 h-4 text-[#f1c40f]" />
                <span className="hidden sm:inline text-xs">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#3498db]" />
                <span className="hidden sm:inline text-xs">Night</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Centered Login Card */}
      <div className="w-full max-w-md">
        {/* Monogram & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#19191d] border border-[rgba(240,240,242,0.15)] text-[#f0f0f2] font-display flex items-center justify-center rounded-xl text-lg font-bold shadow-xs">
            OO
          </div>
          <h1 className="font-display text-xl font-bold uppercase tracking-wider text-[#f0f0f2]">
            OPERATION OFFICE
          </h1>
          <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] mt-1">
            Merchant Support
          </p>
        </div>

        {/* Normal Login Box */}
        <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl p-6 sm:p-7 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Assigned Staff */}
            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                👨‍💼 Assigned Staff <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                list="staff-suggestions"
                value={staffName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setStaffName(newName);
                  const matchedUser = DEFAULT_STAFF_USERS.find(
                    (u) => u.name.toLowerCase() === newName.trim().toLowerCase()
                  );
                  if (matchedUser) {
                    setStaffId(matchedUser.staffId);
                    setRole(matchedUser.role);
                    setDepartment(matchedUser.department);
                  }
                }}
                placeholder="e.g. Nget Monioudom"
                className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71] transition-colors"
              />
              <datalist id="staff-suggestions">
                {DEFAULT_STAFF_USERS.map((user) => (
                  <option key={user.staffId} value={user.name}>
                    Staff ID: {user.staffId} ({user.role})
                  </option>
                ))}
              </datalist>
            </div>

            {/* Field 2: Staff ID */}
            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                Staff ID <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. 222222"
                className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-action-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Dashboard</span>
            </button>
          </form>

          {/* Quick 1-Click Access Buttons */}
          <div className="pt-3 border-t border-[rgba(240,240,242,0.06)]">
            <span className="block text-[11px] font-mono text-[rgba(240,240,242,0.4)] mb-2 uppercase">
              1-Click Quick Access:
            </span>
            <div className="flex flex-col gap-1.5">
              {DEFAULT_STAFF_USERS.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickClick(user)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0f0f11] border border-[rgba(240,240,242,0.06)] hover:border-[#2ecc71]/50 hover:bg-white/5 text-left text-xs transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#19191d] border border-[rgba(240,240,242,0.1)] text-[10px] font-bold text-[#f0f0f2] flex items-center justify-center">
                      {user.avatarInitials}
                    </span>
                    <span className="text-[#f0f0f2] group-hover:text-[#2ecc71] transition-colors">
                      {user.name}
                    </span>
                    <span className="font-mono text-[10px] text-[rgba(240,240,242,0.4)]">
                      ({user.staffId})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] group-hover:text-[#2ecc71]">
                    Enter →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Simple Security Footnote */}
          <div className="text-center pt-1 text-[10px] font-mono text-[rgba(240,240,242,0.4)] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2ecc71]" />
            <span>Authenticated Staff Session</span>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="text-center mt-6 text-[11px] font-mono text-[rgba(240,240,242,0.35)]">
          Merchant POS Operations · Cambodia
        </div>
      </div>
    </div>
  );
};
