'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordInput } from '@/lib/validations/auth';
import { toast } from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';
import { SubSetting } from './SubSetting';

const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch('/api/auth/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to update password');
  }
};

export const ChangePassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const currentPassword = watch('currentPassword');
  const isNewPasswordDisabled = !currentPassword;

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully');
      reset();
    } catch (error: unknown) {
      if (error instanceof Error) {
          toast.error(error.message);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubSetting sectionId="password" title="Change Password" defaultOpen>
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Current Password</label>
              <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter current password"
                    {...register('currentPassword')}
                    className="w-full h-12 rounded-lg bg-slate-50 dark:bg-[#222831] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6b7280] px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-sm font-medium leading-normal ${isNewPasswordDisabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>New Password</label>
              <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password"
                    {...register('newPassword')}
                    disabled={isNewPasswordDisabled}
                    className="w-full h-12 rounded-lg bg-slate-50 dark:bg-[#222831] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6b7280] px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-[#1a2027]"
                  />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-sm font-medium leading-normal ${isNewPasswordDisabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>Confirm Password</label>
              <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    {...register('confirmNewPassword')}
                    disabled={isNewPasswordDisabled}
                    className="w-full h-12 rounded-lg bg-slate-50 dark:bg-[#222831] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6b7280] px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-[#1a2027]"
                  />
              </div>
               {errors.confirmNewPassword && (
                <p className="text-red-500 text-xs">{errors.confirmNewPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isNewPasswordDisabled}
              className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Lock size={18} />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </SubSetting>
  );
};
