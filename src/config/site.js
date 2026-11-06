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
    time: '09:00',
    timezone: 'America/Argentina/Buenos_Aires',
    isoString: '2027-02-12T08:00:00-03:00',
  },

  events: {
    civil: {
      label: 'Ceremonia Civil',
      time: '09:40',
      location: 'Amilcar Lubo 530, Pilar, Buenos Aires',
      address: 'Amilcar Lubo 530, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/t9JijJA69yS8kKxr8',
    },
    reception: {
      label: 'Recepción',
      time: '11:00',
      location: 'Sarmiento 373, Pilar, Buenos Aires',
      address: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/mGJ9DRURN7jrYYcT9',
    },
    sealing: {
      label: 'Sellamiento',
      time: '20:00',
      location: 'Templo de Buenos Aires',
      address: 'Templo de Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/XovpHrcqFNycHw6C9',
    },
  },

  location: {
    title: 'Dónde',
    address: 'Sarmiento 373 · Pilar · Buenos Aires',
    fullAddress: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
    mapsUrl: 'https://maps.app.goo.gl/mGJ9DRURN7jrYYcT9',
    coordinates: { lat: -34.4667, lng: -58.9167 },
  },

  story: {
    title: 'Nuestra Historia',
    paragraphs: [
      'Sofy y Nico se conocen desde hace mucho tiempo. Se conocieron en Instituto, y desde ahí, nunca más se separaron.',
      'Nico esperó a Sofy durante su misión, y juntos, empezaron el sueño de casarse y formar su propia familia',
      'Hoy, ese sueño está cada vez más cerca...'
    ],
    photoUrl: '/assets/templo-1.jpg',
  },

  gallery: {
    title: 'Galería',
    photos: [
      { src: '/assets/story.jpeg', alt: 'Sofy y Nico juntos', caption: 'Nuestra foto favorita' },
      { src: '/assets/Conferencia.jpeg', alt: 'Domingos compartidos', caption: 'Domingos compartidos' },
      { src: '/assets/compromiso.jpg', alt: 'Momento especial', caption: 'Compromiso' },
      { src: '/assets/templo-1.jpg', alt: 'Templo', caption: 'Templo juntos' },
      { src: '/assets/plaza.jpeg', alt: 'Plaza', caption: 'Sonriendo juntos' },
      { src: '/assets/Río.jpeg', alt: 'Río', caption: 'Nuestro lugar en el mundo' },
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
    description: 'Invitación de boda de Sofy y Nico. 19 de febrero de 2027, Pilar, Buenos Aires.',
    ogImage: '/assets/hero.png',
    url: 'https://wedding-invitation-inky-kappa-17.vercel.app/',
    twitterHandle: '@nicolasdfoti',
  },

  contact: {
    email: 'nicolasdfoti@gmail.com',
    phone: '+54 9 11 5387-3620',
  },
};

export default site;