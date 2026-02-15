import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PieChartCard } from '@/components/analytics/PieChartCard';

describe('PieChartCard', () => {
    const mockMatchMedia = (matches: boolean) => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query: string) => ({
                matches,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    };

    // Mock ResizeObserver
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        mockMatchMedia(false);
    });

    beforeEach(() => {
        mockMatchMedia(false);
    });

    it('renders correctly', () => {
        render(<PieChartCard sessions={[]} allTags={[]} />);
        expect(screen.getByText('Activity Distribution')).toBeInTheDocument();
    });

    it('starts collapsed on desktop and opens when toggled', async () => {
        mockMatchMedia(true);
        render(<PieChartCard sessions={[]} allTags={[]} />);

        await waitFor(() => {
            expect(screen.getByLabelText('Show activity distribution')).toBeInTheDocument();
        });

        expect(screen.queryByLabelText('Next period')).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Show activity distribution'));

        await waitFor(() => {
            expect(screen.getByLabelText('Hide activity distribution')).toHaveAttribute('aria-expanded', 'true');
        });

        expect(screen.getByLabelText('Next period')).toBeInTheDocument();
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
