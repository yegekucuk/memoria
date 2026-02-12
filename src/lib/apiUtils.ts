import { NextResponse } from 'next/server';
import { getCurrentUser, UserPayload } from '@/lib/auth';

/**
 * Custom error class for API errors with HTTP status codes.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Authenticate the current user or throw a 401 ApiError.
 * Replaces the repeated auth guard pattern across all protected routes.
 */
export async function requireAuth(): Promise<UserPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  return user;
}

/**
 * Centralized error handler for API routes.
 * Returns the appropriate NextResponse based on error type.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error(`${context}:`, error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Default tag colors used when creating new tags.
 */
export const DEFAULT_TAG_COLORS = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
] as const;

/**
 * Pick a random color from DEFAULT_TAG_COLORS.
 */
export function getRandomTagColor(): string {
  return DEFAULT_TAG_COLORS[Math.floor(Math.random() * DEFAULT_TAG_COLORS.length)];
}

/**
 * Format a database session object into the shape the frontend expects.
 * Converts Date objects to ISO strings and flattens tag objects to names.
 */
export function formatSession(session: {
  id: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  notes: string | null;
  tags: { name: string }[];
}) {
  return {
    id: session.id,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime ? session.endTime.toISOString() : '',
    durationSeconds: session.durationSeconds,
    notes: session.notes || '',
    tags: session.tags.map((t) => t.name),
  };
}
