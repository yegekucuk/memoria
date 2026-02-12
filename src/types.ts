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

export interface User {
  id: string;
  email: string;
  name: string;
}
