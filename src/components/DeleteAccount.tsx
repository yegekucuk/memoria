'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const DeleteAccount: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete account');
        setIsDeleting(false);
        return;
      }

      toast.success('Account deleted');
      await logout();
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-surface-dark p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Account</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Permanently remove your account and all data. This action cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          Delete Account
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
          <Trash2 size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your password to permanently delete your account.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium"
        />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsOpen(false);
              setPassword('');
              setError(null);
            }}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </div>
    </div>
  );
};
