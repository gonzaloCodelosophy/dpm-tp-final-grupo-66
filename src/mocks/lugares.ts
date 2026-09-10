import type { Lugar } from "../types/Lugar";

export const lugares: Lugar[] = [
  {
    id: "lug-playa-norte",
    nombre: "Playa Norte",
    categoriaId: "cat-playas",
    descripcionCorta:
      "Uno de los principales balnearios de Colón sobre el río Uruguay.",
    descripcion:
      "Playa Norte forma parte del conjunto de balnearios de Colón sobre el río Uruguay. Es un espacio destinado al descanso, la recreación y el disfrute del entorno natural.",
    coordenadas: {
      latitud: -32.207,
      longitud: -58.138,
    },
    direccion: "Zona Norte, Colón, Entre Ríos",
    imagenes: [],
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
      "Punta Colón es uno de los balnearios que integran el circuito de playas de la ciudad. Su ubicación permite disfrutar del río Uruguay y de los espacios turísticos cercanos.",
    coordenadas: {
      latitud: -32.20878,
      longitud: -58.14401,
    },
    direccion: "Punta Colón, Colón, Entre Ríos",
    imagenes: [],
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
    descripcionCorta:
      "Uno de los balnearios tradicionales de Colón sobre el río Uruguay.",
    descripcion:
      "Piedras Coloradas forma parte de la oferta de playas de Colón. Se encuentra en una zona próxima al Parque Quirós y a distintos servicios turísticos.",
    coordenadas: {
      latitud: -32.22467,
      longitud: -58.12965,
    },
    direccion: "Piedras Coloradas, Colón, Entre Ríos",
    imagenes: [],
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
    id: "lug-termas-colon",
    nombre: "Termas Colón",
    categoriaId: "cat-termas",
    descripcionCorta:
      "Complejo termal con piscinas, parque y espacios verdes frente al río Uruguay.",
    descripcion:
      "Termas Colón es un complejo termal ubicado al norte de la ciudad. Cuenta con piscinas termales, parque y espacios verdes, además de diferentes propuestas y servicios para los visitantes.",
    coordenadas: {
      latitud: -32.21003,
      longitud: -58.14535,
    },
    direccion: "Batalla de Cepeda 100, Colón, Entre Ríos",
    imagenes: [],
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
    sitioWeb: "https://termascolon.gov.ar/tarifas/",
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
      "Termas San José se encuentra en las cercanías de Colón y cuenta con piscinas de distintas temperaturas, parque acuático, spa, servicios gastronómicos, paseo de artesanos y un entorno natural.",
    coordenadas: {
      latitud: -32.191712,
      longitud: -58.163896,
    },
    direccion: "Acceso por Ruta ex 26 Km 5, San José, Entre Ríos",
    imagenes: [],
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
    telefono: "+54 9 3447 438342",
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-09-10T12:00:00-03:00",
  },
];
