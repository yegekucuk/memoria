import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PieChartCard } from '@/components/analytics/PieChartCard';

describe('PieChartCard', () => {
    // Mock ResizeObserver
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    });

    it('renders correctly', () => {
        render(<PieChartCard sessions={[]} allTags={[]} />);
        expect(screen.getByText('Activity Distribution')).toBeInTheDocument();
    });

    it('disables the next button when viewing the current period (weekly)', () => {
        render(<PieChartCard sessions={[]} allTags={[]} />);
        
        // By default, it's weekly view and current week
        const nextButton = screen.getByLabelText('Next period');
        expect(nextButton).toBeDisabled();
        expect(nextButton).toHaveClass('cursor-not-allowed');
    });

    it('enables the next button when viewing a past period', () => {
        render(<PieChartCard sessions={[]} allTags={[]} />);
        
        const prevButton = screen.getByLabelText('Previous period');
        fireEvent.click(prevButton); // Go to previous week

        const nextButton = screen.getByLabelText('Next period');
        expect(nextButton).not.toBeDisabled();
        expect(nextButton).toHaveClass('cursor-pointer');
    });

    it('disables the next button when viewing the current period (monthly)', () => {
        render(<PieChartCard sessions={[]} allTags={[]} />);
        
        // Switch to monthly view
        const monthlyButton = screen.getByText('Monthly');
        fireEvent.click(monthlyButton);

        const nextButton = screen.getByLabelText('Next period');
        expect(nextButton).toBeDisabled();
    });
});
