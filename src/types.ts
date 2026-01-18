export interface Session {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationSeconds: number;
  tags: string[];
  notes: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ACTIVE_SESSION = 'ACTIVE_SESSION',
  REPORT = 'REPORT',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
