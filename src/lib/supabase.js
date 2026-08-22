import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function submitRSVP(data) {
  if (!supabase) {
    console.warn('Supabase no configurado. Simulando envío...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, data: { id: 'mock-' + Date.now() } };
  }

  const { data: result, error } = await supabase
    .from('rsvps')
    .insert([
      {
        name: data.name,
        attendance: data.attendance,
        message: data.message || null,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return { success: true, data: result };
}

export async function getRSVPs() {
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}