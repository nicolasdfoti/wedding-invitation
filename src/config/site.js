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
      mapsUrl: 'https://maps.app.goo.gl/example-civil',
    },
    reception: {
      label: 'Recepción',
      time: '10:30',
      location: 'Sarmiento 373, Pilar, Buenos Aires',
      address: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/example-reception',
    },
    sealing: {
      label: 'Sellamiento',
      time: '17:30',
      location: 'Templo de Buenos Aires',
      address: 'Templo de Buenos Aires, Argentina',
      mapsUrl: 'https://maps.app.goo.gl/example-sealing',
    },
  },

  location: {
    title: 'Dónde',
    address: 'Sarmiento 373 · Pilar · Buenos Aires',
    fullAddress: 'Sarmiento 373, Pilar, Buenos Aires, Argentina',
    mapsUrl: 'https://maps.app.goo.gl/example-main',
    coordinates: { lat: -34.4667, lng: -58.9167 },
  },

  story: {
    title: 'Nuestra Historia',
    paragraphs: [
      'Todo comenzó una tarde de primavera en la universidad, cuando nuestros caminos se cruzaron en la biblioteca. Lo que empezó como una charla sobre apuntes de clase se convirtió en horas de conversación que no queríamos que terminaran.',
      'A través de los años, hemos compartido sueños, desafíos y incontables mateadas. Cada paso nos confirmó que queríamos caminar juntos el resto de nuestras vidas.',
      'Hoy, con el corazón lleno de alegría, los invitamos a ser testigos de nuestra promesa de amor eterno.',
    ],
    photoUrl: '/assets/hero.png',
  },

  gallery: {
    title: 'Galería',
    photos: [
      { src: '/assets/hero.png', alt: 'Sofy y Nico juntos', caption: 'Nuestra foto favorita' },
      { src: '/assets/hero.png', alt: 'Pareja en la playa', caption: 'Vacaciones 2024' },
      { src: '/assets/hero.png', alt: 'Momento especial', caption: 'Compromiso' },
      { src: '/assets/hero.png', alt: 'Familia', caption: 'Con la familia' },
      { src: '/assets/hero.png', alt: 'Amigos', caption: 'Con amigos' },
      { src: '/assets/hero.png', alt: 'Mascota', caption: 'Nuestra mascota' },
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
      { bank: 'Banco Galicia', alias: 'SOFY.NICO.BODA', cbu: '0070000000000000000000' },
      { bank: 'Mercado Pago', alias: 'sofy.nico.boda', cvu: '0000000000000000000000' },
    ],
    url: 'https://example.com/gift-list',
  },

  rsvp: {
    title: 'Confirmar Asistencia',
    subtitle: 'Por favor confirmá antes del 1 de enero de 2027',
    form: {
      namePlaceholder: 'Nombre y apellido',
      attendanceOptions: [
        { value: 'yes', label: '¡Nos vemos ahí!' },
        { value: 'no', label: 'No podré asistir...' },
      ],
      messagePlaceholder: 'Mensaje o restricción alimentaria (opcional)',
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