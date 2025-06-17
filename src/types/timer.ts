
export interface TimerSession {
  id: string;
  tarea_id: string;
  inicio: string;
  tiempo_transcurrido: number;
  estado: 'activa' | 'pausada' | 'finalizada';
}

export interface TimerContextType {
  activeSession: TimerSession | null;
  currentTime: number;
  isRunning: boolean;
  startTimer: (tareaId: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
}

export interface TimerState {
  session: TimerSession;
  currentTime: number;
  isRunning: boolean;
}
