
import { supabase } from '@/integrations/supabase/client';
import { TimerSession } from '@/types/timer';

export const loadActiveSession = async (userId: string): Promise<TimerSession | null> => {
  try {
    const { data, error } = await supabase
      .from('sesiones_tiempo')
      .select('*')
      .eq('user_id', userId)
      .in('estado', ['activa', 'pausada'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      return {
        ...data,
        estado: data.estado as 'activa' | 'pausada' | 'finalizada'
      };
    }
  } catch (error) {
    console.log('No active session found');
  }
  return null;
};

export const saveProgress = async (sessionId: string, timeElapsed: number): Promise<void> => {
  try {
    await supabase
      .from('sesiones_tiempo')
      .update({
        tiempo_transcurrido: timeElapsed
      })
      .eq('id', sessionId);
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export const createTimerSession = async (userId: string, tareaId: string): Promise<TimerSession | null> => {
  try {
    const { data, error } = await supabase
      .from('sesiones_tiempo')
      .insert({
        user_id: userId,
        tarea_id: tareaId,
        tiempo_transcurrido: 0,
        estado: 'activa'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      estado: data.estado as 'activa' | 'pausada' | 'finalizada'
    };
  } catch (error) {
    console.error('Error creating timer session:', error);
    return null;
  }
};

export const updateSessionState = async (sessionId: string, estado: 'activa' | 'pausada' | 'finalizada', timeElapsed?: number): Promise<void> => {
  try {
    const updateData: any = { estado };
    if (timeElapsed !== undefined) {
      updateData.tiempo_transcurrido = timeElapsed;
    }
    if (estado === 'finalizada') {
      updateData.fin = new Date().toISOString();
    }

    await supabase
      .from('sesiones_tiempo')
      .update(updateData)
      .eq('id', sessionId);
  } catch (error) {
    console.error('Error updating session state:', error);
    throw error;
  }
};

export const updateTaskTime = async (tareaId: string, additionalMinutes: number): Promise<void> => {
  try {
    const { data: tarea } = await supabase
      .from('tareas')
      .select('tiempo_registrado')
      .eq('id', tareaId)
      .single();

    if (tarea) {
      await supabase
        .from('tareas')
        .update({
          tiempo_registrado: (tarea.tiempo_registrado || 0) + additionalMinutes
        })
        .eq('id', tareaId);
    }
  } catch (error) {
    console.error('Error updating task time:', error);
  }
};
