import type { Lugar } from "../types/Lugar";

export const lugares: Lugar[] = [
  // ============================================================
  // PLAYAS
  // ============================================================
  {
    id: "lug-playa-norte",
    nombre: "Playa Norte",
    categoriaId: "cat-playas",
    descripcionCorta:
      "Uno de los principales balnearios de Colón sobre el río Uruguay.",
    descripcion:
      "Playa Norte forma parte del conjunto de balnearios de Colón sobre el río Uruguay. Es uno de los espacios costeros destinados al descanso y la recreación durante la visita a la ciudad.",
    coordenadas: {
      latitud: -32.2138,
      longitud: -58.1397,
    },
    direccion: "Zona Norte, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Playa+Norte"],
    horarios: [],
    telefono: null,
    sitioWeb: "https://www.colonturismo.tur.ar/playas-islas/",
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: true,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-punta-colon",
    nombre: "Punta Colón",
    categoriaId: "cat-playas",
    descripcionCorta:
      "Balneario de Colón ubicado sobre la costa del río Uruguay.",
    descripcion:
      "Punta Colón es uno de los balnearios que integran el circuito de playas de la ciudad. Su ubicación permite disfrutar del río Uruguay y de los espacios turísticos de la zona costera.",
    coordenadas: {
      latitud: -32.20878,
      longitud: -58.14401,
    },
    direccion: "Punta Colón, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Punta+Colón"],
    horarios: [],
    telefono: null,
    sitioWeb: "https://www.colonturismo.tur.ar/playas-islas/",
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-piedras-coloradas",
    nombre: "Piedras Coloradas",
    categoriaId: "cat-playas",
    descripcionCorta: "Balneario tradicional de Colón sobre el río Uruguay.",
    descripcion:
      "Piedras Coloradas forma parte de la oferta de playas de Colón y se encuentra próxima al Parque Quirós y a otros espacios turísticos de la ciudad.",
    coordenadas: {
      latitud: -32.22467,
      longitud: -58.12965,
    },
    direccion: "Piedras Coloradas, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Piedras+Coloradas"],
    horarios: [],
    telefono: null,
    sitioWeb: "https://www.colonturismo.tur.ar/playas-islas/",
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // TERMAS
  // ============================================================
  {
    id: "lug-termas-colon",
    nombre: "Termas Colón",
    categoriaId: "cat-termas",
    descripcionCorta:
      "Complejo termal con piscinas y espacios verdes frente al río Uruguay.",
    descripcion:
      "Termas Colón es un complejo termal ubicado en la ciudad de Colón. Cuenta con piscinas termales, parque y espacios verdes, además de diferentes propuestas y servicios para los visitantes.",
    coordenadas: {
      latitud: -32.21003,
      longitud: -58.14535,
    },
    direccion: "Batalla de Cepeda 100, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Termas+Colon"],
    horarios: [
      {
        dia: 0,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 1,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 2,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 3,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 4,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 5,
        abre: "09:00",
        cierra: "20:00",
      },
      {
        dia: 6,
        abre: "09:00",
        cierra: "20:00",
      },
    ],
    telefono: "+54 9 3447 434761",
    sitioWeb: "https://termascolon.gov.ar/",
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-termas-san-jose",
    nombre: "Termas San José",
    categoriaId: "cat-termas",
    descripcionCorta:
      "Complejo termal con piscinas, parque acuático, spa y paseo de artesanos.",
    descripcion:
      "Termas San José se encuentra en las cercanías de Colón y ofrece piscinas de distintas temperaturas, parque acuático, spa, propuestas gastronómicas y un paseo de artesanos.",
    coordenadas: {
      latitud: -32.191712,
      longitud: -58.163896,
    },
    direccion: "Acceso por Ruta ex 26 Km 5, San José, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Termas+San+José"],
    horarios: [
      {
        dia: 0,
        abre: "09:00",
        cierra: "21:00",
      },
      {
        dia: 2,
        abre: "09:00",
        cierra: "21:00",
      },
      {
        dia: 3,
        abre: "09:00",
        cierra: "21:00",
      },
      {
        dia: 4,
        abre: "09:00",
        cierra: "21:00",
      },
      {
        dia: 5,
        abre: "09:00",
        cierra: "21:00",
      },
      {
        dia: 6,
        abre: "09:00",
        cierra: "21:00",
      },
    ],
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // MUSEOS Y PATRIMONIO
  // ============================================================
  {
    id: "lug-molino-forclaz",
    nombre: "Molino Forclaz",
    categoriaId: "cat-museos",
    descripcionCorta:
      "Monumento Histórico Nacional y museo vinculado a la inmigración de la región.",
    descripcion:
      "El Molino Forclaz representa la historia y el esfuerzo de los inmigrantes que poblaron la región. La familia Forclaz, de origen suizo, estuvo vinculada a la actividad de molienda. Actualmente funciona como museo y Monumento Histórico Nacional y puede visitarse durante todo el año.",
    coordenadas: {
      latitud: -32.1904,
      longitud: -58.1932,
    },
    direccion: "Primeros Colonos s/nº, Ejido Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Molino+Forclaz"],
    horarios: [],
    telefono: "+54 9 3447 577133",
    sitioWeb: "https://molinoforclaz.com/",
    precioEntrada: 10000,
    audioguia: null,
    codigoQr: "COLON:lug-molino-forclaz",
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-museo-historico-regional",
    nombre: "Museo Histórico Regional de Colón",
    categoriaId: "cat-museos",
    descripcionCorta:
      "Museo dedicado a la historia y al desarrollo de la ciudad de Colón.",
    descripcion:
      "El Museo Histórico Regional de Colón reúne bienes donados por la comunidad y narra el origen y desarrollo de la ciudad. Sus salas presentan objetos, herramientas, mobiliario, vestimentas y otros elementos vinculados a la historia local.",
    coordenadas: {
      latitud: -32.2202,
      longitud: -58.1417,
    },
    direccion: "12 de Abril 461, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Museo+Histórico+Regional"],
    horarios: [
      {
        dia: 1,
        abre: "09:00",
        cierra: "13:00",
      },
      {
        dia: 2,
        abre: "09:00",
        cierra: "13:00",
      },
      {
        dia: 3,
        abre: "09:00",
        cierra: "13:00",
      },
      {
        dia: 4,
        abre: "09:00",
        cierra: "13:00",
      },
      {
        dia: 5,
        abre: "09:00",
        cierra: "13:00",
      },
      {
        dia: 6,
        abre: "10:00",
        cierra: "18:00",
      },
    ],
    telefono: "(03447) 426002",
    sitioWeb: null,
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // NATURALEZA
  // ============================================================
  {
    id: "lug-parque-nacional-el-palmar",
    nombre: "Parque Nacional El Palmar",
    categoriaId: "cat-naturaleza",
    descripcionCorta:
      "Área protegida reconocida por sus palmares de yatay y su biodiversidad.",
    descripcion:
      "El Parque Nacional El Palmar conserva un sector representativo del palmar yatay y cuenta con una superficie aproximada de 8.500 hectáreas. Dispone de senderos peatonales, recorridos vehiculares, miradores y diferentes espacios para observar la flora y fauna autóctonas.",
    coordenadas: {
      latitud: -31.8667,
      longitud: -58.25,
    },
    direccion: "Autovía 14 Km 199, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Parque+Nacional+El+Palmar"],
    horarios: [
      {
        dia: 0,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 1,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 2,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 3,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 4,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 5,
        abre: "08:00",
        cierra: "18:00",
      },
      {
        dia: 6,
        abre: "08:00",
        cierra: "18:00",
      },
    ],
    telefono: "(03447) 493049",
    sitioWeb: "https://linktr.ee/pnep",
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-parque-quiros",
    nombre: "Parque Quirós",
    categoriaId: "cat-naturaleza",
    descripcionCorta:
      "Espacio verde con senderos, vegetación y miradores hacia el río Uruguay.",
    descripcion:
      "El Parque Escolar Dr. Herminio Quirós es uno de los espacios verdes más importantes de Colón. Cuenta con frondosa vegetación, senderos, barrancas, juegos infantiles y sectores deportivos, además de funcionar como mirador hacia el río Uruguay.",
    coordenadas: {
      latitud: -32.2241,
      longitud: -58.131,
    },
    direccion: "Bv. Ferrari y Andrade, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Parque+Quirós"],
    horarios: [],
    telefono: null,
    sitioWeb: "https://www.colonturismo.tur.ar/espacios-verdes/",
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // ARTESANÍAS
  // ============================================================
  {
    id: "lug-centro-artesanos-la-casona",
    nombre: "Centro de Artesanos La Casona",
    categoriaId: "cat-artesanias",
    descripcionCorta:
      "Centro de artesanos ubicado en una construcción histórica de Colón.",
    descripcion:
      "El Centro de Artesanos funciona en una construcción histórica de la ciudad que data de 1868. Comparte el espacio con la Escuela Municipal de Arte Cerámico y desarrolla actividades culturales y exposiciones.",
    coordenadas: {
      latitud: -32.2211,
      longitud: -58.1448,
    },
    direccion: "12 de Abril 106, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Centro+de+Artesanos+La+Casona"],
    horarios: [
      {
        dia: 0,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 1,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 2,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 3,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 4,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 5,
        abre: "10:00",
        cierra: "13:00",
      },
      {
        dia: 6,
        abre: "10:00",
        cierra: "13:00",
      },
    ],
    telefono: null,
    sitioWeb: null,
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-feria-manos-del-puerto",
    nombre: "Feria Manos del Puerto",
    categoriaId: "cat-artesanias",
    descripcionCorta:
      "Feria de artesanías y manualidades con creaciones realizadas a mano.",
    descripcion:
      "Feria ubicada en la zona de Peyret y Chacabuco, donde se pueden encontrar artesanías y manualidades. Funciona principalmente los sábados, domingos y feriados.",
    coordenadas: {
      latitud: -32.2232,
      longitud: -58.1416,
    },
    direccion: "Peyret y Chacabuco, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Feria+Manos+del+Puerto"],
    horarios: [],
    telefono: null,
    sitioWeb: null,
    precioEntrada: 0,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // GASTRONOMÍA
  // ============================================================
  {
    id: "lug-bodegon-del-puerto",
    nombre: "Bodegón del Puerto",
    categoriaId: "cat-gastronomia",
    descripcionCorta:
      "Restaurante especializado en cocina regional, pescados de río y pastas caseras.",
    descripcion:
      "Bodegón del Puerto ofrece una propuesta gastronómica con milanesas XL, rabas, pescados de río y pastas caseras. El establecimiento también destaca entre sus características la cocina regional.",
    coordenadas: {
      latitud: -32.2252,
      longitud: -58.1406,
    },
    direccion: "Av. Costanera y Gouchón, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Bodegón+del+Puerto"],
    horarios: [],
    telefono: "+54 (03447) 497186",
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  {
    id: "lug-tota-resto",
    nombre: "Tota Restó",
    categoriaId: "cat-gastronomia",
    descripcionCorta: "Restaurante ubicado en la zona céntrica de Colón.",
    descripcion:
      "Tota Restó es un establecimiento gastronómico registrado en el directorio turístico oficial de Colón.",
    coordenadas: {
      latitud: -32.2204,
      longitud: -58.145,
    },
    direccion: "Moreno 240, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Tota+Restó"],
    horarios: [],
    telefono: "+54 9 3447 597784",
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },

  // ============================================================
  // ALOJAMIENTO
  // ============================================================
  {
    id: "lug-parque-alojamiento",
    nombre: "Parque",
    categoriaId: "cat-alojamiento",
    descripcionCorta:
      "Alojamiento turístico cercano al Parque Quirós y a la playa.",
    descripcion:
      "Alojamiento compuesto por casas y departamentos equipados, ubicado en el centro de Colón y a pasos de la playa. Se encuentra junto al Parque Quirós y ofrece diferentes capacidades de alojamiento.",
    coordenadas: {
      latitud: -32.2228,
      longitud: -58.1358,
    },
    direccion: "Andrade 450, Colón, Entre Ríos",
    imagenes: ["https://placehold.co/600x400/png?text=Parque+Alojamiento"],
    horarios: [],
    telefono: "3447-423730",
    sitioWeb: "https://bungalowsparque.com.ar/",
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },
];
