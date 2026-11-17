// Cuentas para transferir y WhatsApp: viven en un JSON compartido con la función
// de mails (supabase/functions/notify-gift), así los datos son los mismos en todos lados.
import couple from '../../supabase/functions/_shared/couple.json';

export const site = {
  couple: {
    names: 'Sofy & Nico',
    firstName: 'Sofy',
    secondName: 'Nico',
    quote: 'El amor es la única aventura que vale la pena repetir cada día.',
    madeWithLoveBy: 'Hecho con amor por Sofy & Nico',
  },

  wedding: {
    date: '2027-02-12',
    // La cuenta regresiva apunta al primer evento (Ceremonia Civil).
    time: '09:40',
    timezone: 'America/Argentina/Buenos_Aires',
    isoString: '2027-02-12T09:40:00-03:00',
  },

  events: {
    civil: {
      label: 'Ceremonia Civil',
      time: '09:40',
      location: 'Amilcar Lubo 530, Pilar, Buenos Aires',
      address: 'Amilcar Lubo 530, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/t9JijJA69yS8kKxr8',
      durationMinutes: 60,
    },
    reception: {
      label: 'Recepción',
      time: '11:00',
      location: 'Sarmiento 373, Pilar, Buenos Aires',
      address: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/mGJ9DRURN7jrYYcT9',
      durationMinutes: 240,
    },
    sealing: {
      label: 'Sellamiento',
      time: '20:00',
      location: 'Templo de Buenos Aires',
      address: 'Templo de Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/XovpHrcqFNycHw6C9',
      durationMinutes: 60,
    },
  },

  story: {
    title: 'Nuestra Historia',
    paragraphs: [
      'Sofy y Nico se conocen desde hace mucho tiempo. Se conocieron en Instituto, y desde ahí, nunca más se separaron.',
      'Nico esperó a Sofy durante su misión, y juntos, empezaron el sueño de casarse y formar su propia familia',
      'Hoy, ese sueño está cada vez más cerca...'
    ],
    photoUrl: '/assets/templo.webp',
  },

  gallery: {
    title: 'Galería',
    photos: [
      { src: '/assets/story.webp', alt: 'Sofy y Nico juntos', caption: 'Nuestra foto favorita' },
      { src: '/assets/conferencia.webp', alt: 'Domingos compartidos', caption: 'Domingos compartidos' },
      { src: '/assets/compromiso.webp', alt: 'Momento especial', caption: 'Compromiso' },
      { src: '/assets/templo.webp', alt: 'Templo', caption: 'Templo juntos' },
      { src: '/assets/plaza.webp', alt: 'Plaza', caption: 'Sonriendo juntos' },
      { src: '/assets/rio.webp', alt: 'Río', caption: 'Nuestro lugar en el mundo' },
    ],
  },

  dressCode: {
    title: 'Código de Vestimenta',
    description: 'Formal',
    details: [
      'Elegancia y color para celebrar juntos',
      'Colores: ¡Queremos una celebración llena de color!',
      'Vestimenta: Trajes y vestidos elegantes',
    ],
    notice: 'Mujeres: no vestimenta blanca',
  },

  giftList: {
    title: 'Lista de Regalos',
    description: 'Su presencia es el mejor regalo, pero si desean obsequiarnos algo:',
    // Para cambiar cuentas o titular: supabase/functions/_shared/couple.json
    holder: couple.holder,
    accounts: couple.accounts,
    url: '/regalos',
  },

  // WhatsApp para coordinar entregas y consultas (en couple.json).
  contacts: couple.contacts,

  giftsPage: {
    message:
      'Lo más importante es que estés con nosotros ese día. Si además querés hacernos un regalo, armamos esta lista con las cosas que nos van a ayudar a armar nuestra casa.',
    // Los 3 pasos se muestran en una línea, en orden.
    steps: [
      'Elegí algo de la lista y tocá "Lo regalo".',
      'Dejá tu nombre: queda reservado y nadie más lo elige.',
      'Te llevamos al link para comprarlo (o a los datos para transferir). Los links son orientativos: podés comprarlo donde quieras.',
    ],
    whatsappText: 'Hola! Te escribo por la lista de regalos de la boda…',
    priceNote: 'Los precios son de referencia, tomados en noviembre de 2026, y pueden variar.',
    // Campo "Tu mail (opcional)" al reservar → mail de agradecimiento desde Gmail.
    // Ponelo en false si alguna vez desactivan los mails.
    thankYouEmail: true,
  },

  rsvp: {
    title: 'Confirmar Asistencia',
    subtitle: 'Por favor confirmá antes del 1 de enero de 2027',
    deadline: '2027-01-01T23:59:59-03:00',
    closedMessage: 'El plazo para confirmar asistencia ya cerró. Si necesitás avisarnos algo, escribinos directamente.',
    form: {
      namePlaceholder: 'Nombre y apellido',
      cantidadPersonasPlaceholder: 'Cantidad de personas',
      attendanceOptions: [
        { value: 'true', label: '¡Nos vemos ahí!' },
        { value: 'false', label: 'No podré asistir...' },
      ],
      restriccionesPlaceholder: 'Restricciones alimentarias (opcional)',
      messagePlaceholder: 'Mensaje (opcional)',
      submitText: 'Enviar confirmación',
    },
    successMessage: '¡Gracias por confirmar! Te esperamos.',
    errorMessage: 'Hubo un error. Por favor intentá de nuevo.',
  },

  seo: {
    title: 'Sofy & Nico - Nuestra Boda',
    description: 'Invitación de boda de Sofy y Nico. 12 de febrero de 2027, Pilar, Buenos Aires.',
    ogImage: '/assets/og-image.jpg',
    url: 'https://wedding-invitation-inky-kappa-17.vercel.app/',
  },
};

export default site;