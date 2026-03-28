'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { SubSetting } from './SubSetting';
import { AnalyticsToggleSkeleton } from './loading/AnalyticsToggleSkeleton';

export const AnalyticsSettings: React.FC = () => {
    const { settings, toggleExcludeWeekends, isLoading } = useSettings();

    return (
        <SubSetting
            sectionId="analytics"
            title="Analytics"
            subtitle="Customize how your data is displayed"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Exclude weekend activity</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hide Saturday and Sunday from graphs and calculations
                    </p>
                </div>
                {isLoading ? (
                    <AnalyticsToggleSkeleton />
                ) : (
                    <input
                        type="checkbox"
                        checked={settings.excludeWeekends}
                        onChange={toggleExcludeWeekends}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-900"
                    />
                )}
            </div>
        </SubSetting>
    );
};
