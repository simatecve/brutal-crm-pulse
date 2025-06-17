
import { useContext } from 'react';
import { TimerContext } from '@/context/TimerContext';

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Re-export the TimerProvider for backwards compatibility
export { TimerProvider } from '@/components/providers/TimerProvider';
