import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function submitRSVP(data) {
  if (!supabase) {
    console.warn('Supabase no configurado. Simulando envío...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, data: { id: 'mock-' + Date.now() } };
  }

  const { error } = await supabase
    .from('rsvp')
    .insert([
      {
        nombre: data.nombre,
        cantidad_personas: data.cantidadPersonas,
        asistencia: data.asistencia,
        restricciones: data.restricciones || null,
        mensaje: data.mensaje || null,
      },
    ]);

  if (error) throw error;
  return { success: true };
}