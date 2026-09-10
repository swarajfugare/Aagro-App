import React from 'react';
import { X, User, Shield, Key, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types';
import { StatusBadge } from '../common/StatusBadge';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-forest-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-forest-700 border-2 border-forest-500 flex items-center justify-center text-xl font-bold text-amber-400">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold">{user.fullName}</h3>
              <p className="text-xs text-forest-200 mt-0.5">{user.email || user.phone}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.role}
                </span>
                <StatusBadge status={user.status} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Identity Information */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Account Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-500">Email Address</p>
                  <p className="font-medium text-slate-800">{user.email || '—'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-800">{user.phone || '—'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-full">
                <p className="text-[11px] text-slate-500">MySQL Application User ID</p>
                <p className="font-mono text-xs text-slate-700 break-all">{user.id}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-full">
                <p className="text-[11px] text-slate-500">Firebase Identity UID</p>
                <p className="font-mono text-xs text-slate-700 break-all">{user.firebaseUid}</p>
              </div>
            </div>
          </div>

          {/* Granular Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Permissions
              </h4>
              <span className="text-xs font-medium text-slate-500">
                {user.permissions.length} granted
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono flex items-center gap-1 border border-slate-200"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
