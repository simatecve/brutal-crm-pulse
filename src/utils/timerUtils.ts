
interface TimerPersistenceState {
  session: any;
  sessionStartTime: number;
  isRunning: boolean;
}

export const saveTimerState = (state: TimerPersistenceState) => {
  try {
    localStorage.setItem('activeTimer', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
};

export const loadTimerState = (): TimerPersistenceState | null => {
  try {
    const saved = localStorage.getItem('activeTimer');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading timer state:', error);
  }
  return null;
};

export const shouldSaveProgress = (time: number): boolean => {
  return time % 30 === 0;
};
