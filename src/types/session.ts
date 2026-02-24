export interface Session {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationSeconds: number;
  tags: string[];
  notes: string;
}

/** Shape of the data shown in the post-session report modal. */
export interface SessionReportData {
  duration: number;
  startTime: string; // ISO string
  sessionId: string;
}

/**
 * Shape of a raw database session before it is formatted for the frontend.
 * Used by `formatSession()` in apiUtils.
 */
export interface RawDbSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  notes: string | null;
  tags: { name: string }[];
}
