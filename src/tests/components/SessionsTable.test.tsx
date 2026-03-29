
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionsTable } from '@/components/SessionsTable';
import { Session } from '@/types';

// Mock useTags
jest.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      { id: '1', name: 'Work', color: '#ff0000' },
      { id: '2', name: 'Study', color: '#00ff00' },
    ],
  }),
}));

// Mock ConfirmationModal and EditSessionModal
jest.mock('@/components/ConfirmationModal', () => ({
  ConfirmationModal: ({ isOpen, onConfirm, onClose }: { isOpen: boolean; onConfirm: () => void; onClose: () => void }) => (
    isOpen ? (
        <div data-testid="confirmation-modal">
            <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
            <button onClick={onClose} data-testid="cancel-delete">Cancel</button>
        </div>
    ) : null
  ),
}));

jest.mock('@/components/EditSessionModal', () => ({
  EditSessionModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="edit-session-modal"><button onClick={onClose}>Close</button></div> : null
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Pencil: () => <span data-testid="icon-pencil">Pencil</span>,
    Trash2: () => <span data-testid="icon-trash">Trash2</span>,
    Tag: () => <span>Tag</span>,
    Calendar: () => <span>Calendar</span>,
    Clock: () => <span>Clock</span>,
    Timer: () => <span>Timer</span>,
    Search: () => <span>Search</span>,
    X: () => <span>X</span>,
    Filter: () => <span>Filter</span>,
    ChevronLeft: () => <span>ChevronLeft</span>,
    ChevronRight: () => <span>ChevronRight</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    Download: () => <span>Download</span>,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('SessionsTable', () => {
    const mockOnUpdate = jest.fn();

    const sessions: Session[] = [
        {
            id: '1',
            startTime: '2023-01-01T10:00:00Z',
            endTime: '2023-01-01T11:00:00Z',
            durationSeconds: 3600, // 1h
            tags: ['Work'],
            notes: 'First session notes',
        },
        {
            id: '2',
            startTime: '2023-01-02T14:30:00Z',
            endTime: '2023-01-02T15:00:00Z',
            durationSeconds: 1800, // 30m
            tags: ['Study'],
            notes: 'Second session notes',
        },
        {
            id: '3',
            startTime: '2023-01-03T09:00:00Z',
            endTime: '', // Running, but has notes
            durationSeconds: 120, // 2m
            tags: [],
            notes: 'Running notes',
        },
         {
            id: '4',
            startTime: '2023-01-04T10:00:00Z',
            endTime: '', // Running, but has tags
            durationSeconds: 300, 
            tags: ['Work'], // Has tags
            notes: '', 
        },
        {
            id: '5',
            startTime: '2023-01-05T10:00:00Z',
            endTime: '', // Running
            durationSeconds: 60,
            tags: [], // No tags
            notes: '', // No notes
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders sessions correctly and hides empty running sessions', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);

        // ID 1, 2, 3, 4 should be visible. ID 5 should be hidden.
        // ID 5 is running (no endTime) AND no tags AND no notes.

        expect(screen.getByText('First session notes')).toBeInTheDocument();
        expect(screen.getByText('Second session notes')).toBeInTheDocument();
        expect(screen.getByText('Running notes')).toBeInTheDocument();
        
        // Count rows. 1 header + 4 data rows = 5 rows.
        expect(screen.getAllByRole('row')).toHaveLength(5);
    });

    it('filters by Start Date', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);
        
        const startDateInput = screen.getByLabelText('Start Date');
        fireEvent.change(startDateInput, { target: { value: '2023-01-02' } });

        // Session 1 (Jan 1) should be gone.
        expect(screen.queryByText('First session notes')).not.toBeInTheDocument();
        // Session 2 (Jan 2) should be there.
        expect(screen.getByText('Second session notes')).toBeInTheDocument();
    });

    it('filters by End Date', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);
        
        const endDateInput = screen.getByLabelText('End Date');
        fireEvent.change(endDateInput, { target: { value: '2023-01-01' } });

         // Session 1 (Jan 1) should be there.
        expect(screen.getByText('First session notes')).toBeInTheDocument();
        // Session 2 (Jan 2) should be gone.
        expect(screen.queryByText('Second session notes')).not.toBeInTheDocument();
    });

    it('filters by Search Notes', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);
        
        const searchInput = screen.getByPlaceholderText('Type to search...');
        fireEvent.change(searchInput, { target: { value: 'Second' } });

        expect(screen.queryByText('First session notes')).not.toBeInTheDocument();
        expect(screen.getByText('Second session notes')).toBeInTheDocument();
    });

     it('filters by Tags', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);
        
        // Find tag filter buttons. They are buttons with Name "Work" and "Study" + 2 clears/close buttons maybe?
        // Let's filter by 'Work'.
        const workButton = screen.getByRole('button', { name: 'Work' });
        
        fireEvent.click(workButton);

        // Session 1 has Work. Session 2 has Study.
        expect(screen.getByText('First session notes')).toBeInTheDocument();
        expect(screen.queryByText('Second session notes')).not.toBeInTheDocument();
    });

    it('opens edit modal on click', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);

        const editButtons = screen.getAllByTitle('Edit Session');
        fireEvent.click(editButtons[0]);

        expect(screen.getByTestId('edit-session-modal')).toBeInTheDocument();
    });

    it('opens delete confirmation modal and handles delete', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);

        const deleteButtons = screen.getAllByTitle('Delete Session');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        
        const confirmBtn = screen.getByTestId('confirm-delete');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/sessions/'), expect.objectContaining({ method: 'DELETE' }));
        });
        
        expect(mockOnUpdate).toHaveBeenCalled();
    });
    
    it('shows empty state when no sessions match filters', () => {
        render(<SessionsTable sessions={sessions} onUpdate={mockOnUpdate} />);
        
        const searchInput = screen.getByPlaceholderText('Type to search...');
        fireEvent.change(searchInput, { target: { value: 'NonExistentNote' } });

        expect(screen.getByText('No sessions match your filters.')).toBeInTheDocument();
    });
});
