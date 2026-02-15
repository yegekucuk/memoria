import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActivityChart } from '@/components/analytics/ActivityChart';
import { ChartBar } from '@/hooks/useAnalyticsData';

// Mock formatDuration to generic string for easier testing if needed, 
// OR simpler to test exact output "X hours Y minutes"
// Given I just saw the code: `${h} hours ${m} minutes`

describe('ActivityChart', () => {
    const mockDataFullWeek: ChartBar[] = [
        { label: 'Mon', value: 2, isFuture: false },
        { label: 'Tue', value: 2, isFuture: false },
        { label: 'Wed', value: 2, isFuture: false },
        { label: 'Thu', value: 2, isFuture: false },
        { label: 'Fri', value: 2, isFuture: false },
        { label: 'Sat', value: 2, isFuture: false },
        { label: 'Sun', value: 2, isFuture: false },
    ];

    const mockDataPartialWeek: ChartBar[] = [
        { label: 'Mon', value: 6, isFuture: false },
        { label: 'Tue', value: 0, isFuture: false },
        { label: 'Wed', value: 6, isFuture: false },
        { label: 'Thu', value: 0, isFuture: true },
        { label: 'Fri', value: 0, isFuture: true },
        { label: 'Sat', value: 0, isFuture: true },
        { label: 'Sun', value: 0, isFuture: true },
    ];

    it('displays correct average for a full past week (divide by 7)', () => {
        // Total = 14 hours. Average = 2 hours.
        render(
            <ActivityChart 
                chartData={mockDataFullWeek}
                maxVal={10}
                viewMode="weekly"
                totalPeriodHours={14}
                allTags={[]}
                selectedFilterTags={[]}
                onToggleFilterTag={() => {}}
                onClearFilters={() => {}}
                onPrev={() => {}}
                onNext={() => {}}
                dateLabel="Test Date"
                setViewMode={() => {}}
            />
        );

        // Expect "Average" label
        const label = screen.getByText('Average');
        const container = label.closest('div');
        expect(container).toHaveTextContent('2 hours 0 minutes');
    });

    it('displays correct average for a partial week (divide by non-future days)', () => {
        // Total = 12 hours. Non-future days = 3 (Mon, Tue, Wed).
        // Average = 12 / 3 = 4 hours.
        render(
            <ActivityChart 
                chartData={mockDataPartialWeek}
                maxVal={10}
                viewMode="weekly"
                totalPeriodHours={12}
                allTags={[]}
                selectedFilterTags={[]}
                onToggleFilterTag={() => {}}
                onClearFilters={() => {}}
                onPrev={() => {}}
                onNext={() => {}}
                dateLabel="Test Date"
                setViewMode={() => {}}
            />
        );

        // Expect "Average" label
        const label = screen.getByText('Average');
        const container = label.closest('div');
        expect(container).toHaveTextContent('4 hours 0 minutes');
    });

    it('highlights today label with primary color', () => {
        const mockDataWithToday: ChartBar[] = [
            { label: 'Mon', value: 2, isFuture: false, isToday: true },
            { label: 'Tue', value: 2, isFuture: false, isToday: false },
        ];

        render(
            <ActivityChart 
                chartData={mockDataWithToday}
                maxVal={10}
                viewMode="weekly"
                totalPeriodHours={4}
                allTags={[]}
                selectedFilterTags={[]}
                onToggleFilterTag={() => {}}
                onClearFilters={() => {}}
                onPrev={() => {}}
                onNext={() => {}}
                dateLabel="Test Date"
                setViewMode={() => {}}
            />
        );

        const todayLabel = screen.getByText('Mon');
        expect(todayLabel).toHaveClass('text-primary');
        expect(todayLabel).toHaveClass('font-bold');

        const otherLabel = screen.getByText('Tue');
        expect(otherLabel).not.toHaveClass('text-primary');
    });

    it('disables the next button when isNextDisabled is true', () => {
        render(
            <ActivityChart 
                chartData={[]}
                maxVal={10}
                viewMode="weekly"
                totalPeriodHours={0}
                isNextDisabled={true}
                allTags={[]}
                selectedFilterTags={[]}
                onToggleFilterTag={() => {}}
                onClearFilters={() => {}}
                onPrev={() => {}}
                onNext={() => {}}
                dateLabel="Test Date"
                setViewMode={() => {}}
            />
        );

        const nextButton = screen.getByLabelText('Next period');
        expect(nextButton).toBeDisabled();
        expect(nextButton).toHaveClass('cursor-not-allowed');
    });
});
