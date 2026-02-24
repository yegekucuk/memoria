export type ViewMode = 'weekly' | 'monthly';

export interface ChartBar {
  label: string;
  value: number;
  fullDate?: string;
  isFuture?: boolean;
  isToday?: boolean;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}
