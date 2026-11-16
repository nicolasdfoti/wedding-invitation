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
  },

  giftList: {
    title: 'Lista de Regalos',
    description: 'Su presencia es el mejor regalo, pero si desean obsequiarnos algo:',
    accounts: [
      { bank: 'Banco BBVA', alias: 'nicolasfoti', cbu: '0170039840000034645646' },
      { bank: 'Mercado Pago', alias: 'nicolasdfoti', cvu: '0000003100035561508263' },
    ],
    url: 'https://docs.google.com/spreadsheets/d/1W6zMDF4_RY91wbJqeuTRuJjl34cl6uly7o_jBrrLIqI/edit?usp=drive_web&ouid=101677422371794383247',
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