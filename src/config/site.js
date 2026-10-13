export const site = {
  couple: {
    names: 'Sofy & Nico',
    firstName: 'Sofy',
    secondName: 'Nico',
    quote: 'El amor es la única aventura que vale la pena repetir cada día.',
    madeWithLoveBy: 'Hecho con amor por Sofy & Nico',
  },

  wedding: {
    date: '2027-02-19',
    time: '17:00',
    timezone: 'America/Argentina/Buenos_Aires',
    isoString: '2027-02-19T17:00:00-03:00',
  },

  events: {
    civil: {
      label: 'Ceremonia Civil',
      time: '09:15',
      location: 'Sarmiento 373, Pilar, Buenos Aires',
      address: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/t9JijJA69yS8kKxr8',
    },
    reception: {
      label: 'Recepción',
      time: '10:30',
      location: 'Sarmiento 373, Pilar, Buenos Aires',
      address: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/mGJ9DRURN7jrYYcT9',
    },
    sealing: {
      label: 'Sellamiento',
      time: '17:30',
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
    description: 'Elegante / Semi-formal',
    details: [
      'Se sugiere traje oscuro o vestido de cóctel',
      'Colores recomendados: tonos tierra, azul marino, verde oliva, champán',
      'Evitar blanco, negro total y colores neón',
      'Calzado cómodo para disfrutar toda la noche',
    ],
  },

  giftList: {
    title: 'Lista de Regalos',
    description: 'Su presencia es el mejor regalo, pero si desean obsequiarnos algo:',
    accounts: [
      { bank: 'Banco BBVA', alias: 'nicolasfoti', cbu: '0170039840000034645646' },
      { bank: 'Mercado Pago', alias: 'nicolasdfoti', cvu: '0000003100035561508263' },
    ],
    url: 'https://example.com/gift-list',
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
    url: 'https://sofyynico.com',
    twitterHandle: '@sofyynico',
  },

  contact: {
    email: 'boda@sofyynico.com',
    phone: '+54 9 11 1234-5678',
  },
};

export default site;