import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Analytics } from '@/components/Analytics';
import { Session, Tag } from '@/types';

interface MockActivityChartProps {
  totalPeriodHours: number;
  allTags?: Tag[];
  onToggleFilterTag?: (tagName: string) => void;
  onClearFilters?: () => void;
  selectedFilterTags?: string[];
}

// Mock useTags
jest.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      { id: '1', name: 'Work', color: '#ff0000' },
      { id: '2', name: 'Study', color: '#00ff00' },
      { id: '3', name: 'Gym', color: '#0000ff' },
    ],
  }),
}));

// Mock useAnalyticsData — captures the sessions passed in so we can verify filtering
const mockUseAnalyticsData = jest.fn();
jest.mock('@/hooks/useAnalyticsData', () => ({
  useAnalyticsData: (sessions: Session[]) => {
    mockUseAnalyticsData(sessions);
    const totalPeriodHours = sessions.reduce((acc, s) => acc + s.durationSeconds / 3600, 0);
    return {
      viewMode: 'weekly' as const,
      setViewMode: jest.fn(),
      dateLabel: 'Oct 2 - Oct 8',
      handlePrev: jest.fn(),
      handleNext: jest.fn(),
      chartData: [],
      totalPeriodHours,
      maxVal: 4,
      totalHoursAllTime: totalPeriodHours,
      topTagName: 'Work',
      topTagPct: 50,
    };
  },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Tag: () => <span>Tag</span>,
  Sigma: () => <span>Sigma</span>,
  Loader2: () => <span>Loader2</span>,
  X: () => <span>X</span>,
  TrendingUp: () => <span>TrendingUp</span>,
  Clock: () => <span>Clock</span>,
  Target: () => <span>Target</span>,
  Zap: () => <span>Zap</span>,
}));

// Mock child components to isolate Analytics logic

jest.mock('@/components/layout/PageHeader', () => ({
  PageHeader: () => <div data-testid="page-header">Header</div>,
}));

jest.mock('@/components/analytics/ActivityChart', () => ({
  ActivityChart: ({ 
    totalPeriodHours, 
    allTags = [], 
    onToggleFilterTag = () => {}, 
    onClearFilters = () => {}, 
    selectedFilterTags = [] 
  }: MockActivityChartProps) => (
    <div data-testid="activity-chart" data-total={totalPeriodHours}>
      <div>Filter by Tags</div>
      {selectedFilterTags.length > 0 && <button onClick={onClearFilters}>Clear</button>}
      {allTags.length === 0 && <span>No tags available.</span>}
      {allTags.map((tag) => (
        <button key={tag.id} onClick={() => onToggleFilterTag(tag.name)}>
          {tag.name}
        </button>
      ))}
      Chart
    </div>
  ),
}));

jest.mock('@/components/layout/PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/analytics/WeeklyCalendar', () => ({
  WeeklyCalendar: () => <div data-testid="weekly-calendar">WeeklyCalendar</div>,
}));

jest.mock('@/components/analytics/MonthlyCalendar', () => ({
  MonthlyCalendar: () => <div data-testid="monthly-calendar">MonthlyCalendar</div>,
}));

jest.mock('@/components/analytics/PieChartCard', () => ({
  PieChartCard: () => <div data-testid="pie-chart-card">PieChartCard</div>,
}));

jest.mock('@/context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { excludeWeekends: false },
  }),
}));

describe('Analytics - Tag Filter', () => {
  const sessions: Session[] = [
    {
      id: '1',
      startTime: '2023-10-02T10:00:00.000Z',
      endTime: '2023-10-02T12:00:00.000Z',
      durationSeconds: 7200, // 2 hours
      tags: ['Work'],
      notes: '',
    },
    {
      id: '2',
      startTime: '2023-10-03T10:00:00.000Z',
      endTime: '2023-10-03T11:00:00.000Z',
      durationSeconds: 3600, // 1 hour
      tags: ['Study'],
      notes: '',
    },
    {
      id: '3',
      startTime: '2023-10-04T10:00:00.000Z',
      endTime: '2023-10-04T11:30:00.000Z',
      durationSeconds: 5400, // 1.5 hours
      tags: ['Gym'],
      notes: '',
    },
    {
      id: '4',
      startTime: '2023-10-05T08:00:00.000Z',
      endTime: '2023-10-05T09:00:00.000Z',
      durationSeconds: 3600, // 1 hour
      tags: ['Work', 'Study'],
      notes: '',
    },
  ];

  beforeEach(() => {
    mockUseAnalyticsData.mockClear();
  });

  it('renders all tag filter buttons', () => {
    render(<Analytics sessions={sessions} />);

    expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Study' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gym' })).toBeInTheDocument();
  });

  it('shows "Filter by Tags" label', () => {
    render(<Analytics sessions={sessions} />);

    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
  });

  it('shows empty state when no tags are available', () => {
    const useTagsMock = jest.requireMock('@/hooks/useTags');
    const original = useTagsMock.useTags;
    useTagsMock.useTags = () => ({ tags: [] });

    render(<Analytics sessions={sessions} />);
    expect(screen.getByText('No tags available.')).toBeInTheDocument();

    useTagsMock.useTags = original;
  });

  it('passes all sessions when no tags selected', () => {
    render(<Analytics sessions={sessions} />);

    // useAnalyticsData should receive all 4 sessions
    const lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(4);
  });

  it('filters sessions when a single tag is selected', () => {
    render(<Analytics sessions={sessions} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));

    // Only session 3 (Gym) should be passed
    const lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
    expect(lastCall[0][0].id).toBe('3');
  });

  it('uses intersection logic (session must have ALL selected tags)', () => {
    render(<Analytics sessions={sessions} />);

    // Select "Work" -> sessions 1 and 4
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    let lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(2);

    // Also select "Study" -> only session 4 has both Work AND Study
    fireEvent.click(screen.getByRole('button', { name: 'Study' }));
    lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
    expect(lastCall[0][0].id).toBe('4');
  });

  it('deselects a tag when clicked again', () => {
    render(<Analytics sessions={sessions} />);

    // Select "Work"
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    let lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(2);

    // Deselect "Work"
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(4);
  });

  it('clears all selected tags via Clear button', () => {
    render(<Analytics sessions={sessions} />);

    // No Clear button initially
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();

    // Select a tag
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));

    // Clear button should appear
    const clearButton = screen.getByText('Clear').closest('button');
    expect(clearButton).toBeInTheDocument();

    // Click Clear — all sessions should be passed again
    fireEvent.click(clearButton!);
    const lastCall = mockUseAnalyticsData.mock.calls[mockUseAnalyticsData.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(4);
  });

  it('reflects filtered data in the chart total', () => {
    render(<Analytics sessions={sessions} />);

    // Select "Gym" — only 1.5h session
    fireEvent.click(screen.getByRole('button', { name: 'Gym' }));

    const chart = screen.getByTestId('activity-chart');
    const total = parseFloat(chart.getAttribute('data-total') || '0');
    expect(total).toBeCloseTo(1.5, 1);
  });
});
