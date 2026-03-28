import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SETTINGS_PANEL_STATE_KEY_PREFIX } from '@/constants';

interface SubSettingProps {
  sectionId: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface SubSettingContentProps extends SubSettingProps {
  userId?: string;
}

const getStoredPanelState = (userId: string, sectionId: string): boolean | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storageKey = `${SETTINGS_PANEL_STATE_KEY_PREFIX}:${userId}:${sectionId}`;

  try {
    const storedState = localStorage.getItem(storageKey);
    if (storedState === null) {
      return null;
    }

    const parsedState: unknown = JSON.parse(storedState);
    return typeof parsedState === 'boolean' ? parsedState : null;
  } catch {
    return null;
  }
};

const SubSettingContent: React.FC<SubSettingContentProps> = ({
  userId,
  sectionId,
  title,
  subtitle,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    if (!userId) {
      return defaultOpen;
    }

    const storedState = getStoredPanelState(userId, sectionId);
    return storedState ?? defaultOpen;
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    const storageKey = `${SETTINGS_PANEL_STATE_KEY_PREFIX}:${userId}:${sectionId}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(isOpen));
    } catch {}
  }, [isOpen, sectionId, userId]);

  return (
    <div className="w-full border-b border-slate-200 dark:border-white/10 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between text-left group cursor-pointer"
      >
        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{title}</h2>
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`mt-1 p-1 rounded-md transition-colors group-hover:bg-slate-100 dark:group-hover:bg-white/5`}>
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SubSetting: React.FC<SubSettingProps> = (props) => {
  const { user } = useAuth();
  const userId = user?.id;

  return (
    <SubSettingContent
      key={`${userId ?? 'guest'}:${props.sectionId}:${props.defaultOpen ? 'open' : 'closed'}`}
      userId={userId}
      {...props}
    />
  );
};
