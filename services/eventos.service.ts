import { Evento } from "../types/evento";
import eventosMock from "../mocks/mock-eventos-colon-turismo.json";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function obtenerEventos(): Promise<Evento[]> {
    await delay(300); // Simulamos latencia de red
    
    return eventosMock as Evento[];
}

export async function obtenerEventoPorId(id: string): Promise<Evento | undefined> {
    await delay(300);
    return (eventosMock as Evento[]).find(evento => evento.id === id);
}