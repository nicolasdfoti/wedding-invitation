const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientPromise = null;

// El cliente de Supabase se carga recién cuando hace falta (al enviar el RSVP),
// así no suma peso a la carga inicial de la invitación.
function getClient() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey)
    );
  }
  return clientPromise;
}

export async function submitRSVP(data) {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.warn('Supabase no configurado. Simulando envío (solo en desarrollo)...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    }
    // En producción nunca simulamos: el invitado tiene que saber que no se guardó.
    throw new Error('Faltan variables de entorno: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY');
  }

  const supabase = await getClient();
  const { error } = await supabase.from('rsvp').insert([
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
