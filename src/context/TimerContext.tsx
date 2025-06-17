
import { createContext } from 'react';
import { TimerContextType } from '@/types/timer';

export const TimerContext = createContext<TimerContextType | undefined>(undefined);
