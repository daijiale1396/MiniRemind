
export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export type ReminderCategory = 'general' | 'water' | 'stretch' | 'eye' | 'break';
export type RepeatType = 'none' | 'workdays' | 'daily';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  isCompleted: boolean;
  createdAt: number;
  category?: ReminderCategory;
  mode?: 'once' | 'interval';
  repeatType?: RepeatType;
  startTime?: string;
  endTime?: string;
  intervalMinutes?: number;
  priority?: Priority;
  soundUrl?: string;
  lastTriggeredAt?: number;
  lastCompletedAt?: number; // 记录上次点击完成的时间
  completedCount: number;   // 累计完成次数
}

export interface HealthGoal {
  category: ReminderCategory;
  label: string;
  current: number;
  target: number;
}

export type WidgetTheme = 'glass' | 'cyber' | 'retro' | 'sakura';

declare global {
  interface Window {
    electronAPI: {
      controlWindow: (command: 'minimize' | 'maximize' | 'close') => void;
      setWindowMode: (mode: 'widget' | 'main') => void;
      sendNotification: (data: { title: string; body: string }) => void;
      onToggleWidgetMode: (callback: () => void) => void;
    };
  }
}
