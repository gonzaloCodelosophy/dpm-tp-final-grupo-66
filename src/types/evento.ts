export type EstadoEvento =
    | "programado"
    | "suspendido"
    | "cancelado"
    | "finalizado";

export interface Coordenadas {
    latitud: number;
    longitud: number;
}

export interface Evento {
    id: string;
    titulo: string;
    descripcion: string;
    lugarId: string | null;
    direccionLibre: string | null;
    coordenadas: Coordenadas | null;
    inicio: string; // ISO 8601
    fin: string | null; // ISO 8601
    imagenUrl: string | null;
    precio: number | null;
    estado: EstadoEvento;
}
