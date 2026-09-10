import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Evento } from '../../types/evento';
import { obtenerEventos } from '../../services/eventos.service';
import TarjetaEvento from '../../components/tarjeta-evento';

const ESTADOS = ['Todos', 'Programados', 'Suspendidos', 'Cancelados'];

export default function AgendaScreen() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [fechasUnicas, setFechasUnicas] = useState<string[]>([]);
    const [filtroFecha, setFiltroFecha] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const router = useRouter();

    useEffect(() => {
        obtenerEventos()
            .then((data) => {
                const validos = data.filter(e => e.inicio);
                const ordenados = validos.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
                setEventos(ordenados);

                const fechas = [...new Set(ordenados.map(e => e.inicio.split('T')[0]))];
                setFechasUnicas(fechas);
                if (fechas.length > 0) setFiltroFecha(fechas[0]);
            })
            .catch((error) => console.error("Error al cargar eventos:", error));
    }, []);

    const eventosFiltrados = eventos.filter(evento => {
        const coincideFecha = filtroFecha === null || evento.inicio.startsWith(filtroFecha);
        const estadoEv = evento.estado || 'Programado';
        
        let coincideEstado = true;
        if (filtroEstado === 'Programados') coincideEstado = estadoEv === 'programado';
        if (filtroEstado === 'Suspendidos') coincideEstado = estadoEv === 'suspendido';
        if (filtroEstado === 'Cancelados') coincideEstado = estadoEv === 'cancelado';

        return coincideFecha && coincideEstado;
    });

    const formatearDiaTab = (fechaStr: string) => {
        const fecha = new Date(fechaStr + "T12:00:00"); // Forzar mediodía para evitar desfases de zona horaria
        const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase();
        const numero = fecha.getDate();
        return { diaSemana, numero };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Agenda</Text>
            <Text style={styles.headerSubtitle}>Qué hacer en Colón</Text>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateTabs}>
                    {fechasUnicas.map(fecha => {
                        const { diaSemana, numero } = formatearDiaTab(fecha);
                        const isSelected = filtroFecha === fecha;
                        return (
                            <TouchableOpacity 
                                key={fecha} 
                                style={[styles.dateTab, isSelected && styles.dateTabSelected]}
                                onPress={() => setFiltroFecha(fecha)}
                            >
                                <Text style={[styles.dateTabDay, isSelected && styles.textWhite]}>{diaSemana}</Text>
                                <Text style={[styles.dateTabNumber, isSelected && styles.textWhite]}>{numero}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusPills}>
                    {ESTADOS.map(estado => (
                        <TouchableOpacity 
                            key={estado} 
                            style={[styles.statusPill, filtroEstado === estado && styles.statusPillSelected]}
                            onPress={() => setFiltroEstado(estado)}
                        >
                            <Text style={[styles.statusPillText, filtroEstado === estado && styles.textWhite]}>{estado}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={eventosFiltrados}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TarjetaEvento evento={item} onPress={() => router.push(`/evento/${item.id}`)} />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos para esta selección.</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 40 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 16, color: '#111' },
    headerSubtitle: { fontSize: 16, marginHorizontal: 16, color: '#666', marginBottom: 16 },
    filtersContainer: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    
    dateTabs: { paddingHorizontal: 16, marginBottom: 12 },
    dateTab: { backgroundColor: '#eee', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginRight: 10, alignItems: 'center', minWidth: 65 },
    dateTabSelected: { backgroundColor: '#FF6B35' },
    dateTabDay: { fontSize: 12, color: '#555', fontWeight: 'bold' },
    dateTabNumber: { fontSize: 20, color: '#111', fontWeight: 'bold', marginTop: 2 },
    
    statusPills: { paddingHorizontal: 16 },
    statusPill: { backgroundColor: '#eee', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginRight: 10 },
    statusPillSelected: { backgroundColor: '#FF6B35' },
    statusPillText: { fontSize: 13, color: '#555', fontWeight: 'bold' },
    textWhite: { color: '#fff' },
    
    listContainer: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#666', marginTop: 20 }
});