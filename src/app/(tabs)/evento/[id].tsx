import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Linking, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Evento } from '../../../types/evento';
import { obtenerEventoPorId } from '../../../services/eventos.service';
import * as Notifications from 'expo-notifications'; //! importado únicamente para botón de prueba de notificaciones

import BotonEventoFavorito from '../../../components/boton-evento-favorito';

export default function PantallaDetalleEvento() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (id) {
            obtenerEventoPorId(id).then(data => {
                setEvento(data || null);
                setCargando(false);
            });
        }
    }, [id]);

    if (cargando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!evento) {
        return (
            <View style={styles.center}>
                <Text>Evento no encontrado.</Text>
            </View>
        );
    }

    const fechaObj = new Date(evento.inicio);
    const esSinHorario = evento.inicio.includes("T00:00:00");

    const fechaSolo = fechaObj.toLocaleDateString('es-AR');
    const fechaCompleta = fechaObj.toLocaleString('es-AR');

    const abrirMapaNativo = () => {
        if (!evento?.coordenadas) return;

        const { latitud, longitud } = evento.coordenadas;
        const label = encodeURIComponent(evento.titulo);
        const latLng = `${latitud},${longitud}`;

        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url).catch(err => console.error("Error al abrir los mapas", err));
        }
    };

    //! Función para probar notificaciones push
    const probarNotificacion = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 ¡Prueba de Notificación!",
                body: `Esta es una prueba para el evento: ${evento?.titulo}`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5,
            },
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Detalle del Evento' }} />

            {evento.imagenUrl && (
                <Image
                    source={{ uri: evento.imagenUrl }}
                    style={styles.headerImage}
                    resizeMode="cover"
                />
            )}

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{evento.titulo}</Text>
                    <BotonEventoFavorito evento={evento} />
                </View>

                {esSinHorario ? (
                    <Text style={styles.date}>Inicio: {fechaSolo} (Sin horario asignado)</Text>
                ) : (
                    <Text style={styles.date}>Inicio: {fechaCompleta}</Text>
                )}

                <View style={styles.divider} />

                <Text style={styles.description}>{evento.descripcion}</Text>

                {/* BOTÓN TEMPORAL PARA PRUEBAS - ELIMINAR ANTES DE PRODUCCIÓN */}
                <TouchableOpacity
                    style={{ backgroundColor: 'red', padding: 12, borderRadius: 8, marginTop: 20, alignItems: 'center' }}
                    onPress={probarNotificacion}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>🧪 Probar Notificación Push para {evento.titulo}</Text>
                </TouchableOpacity>

                <Text style={styles.subtitle}>Ubicación</Text>
                <Text style={styles.text}>{evento.direccionLibre || 'Ver en mapa'}</Text>

                {evento.coordenadas && (
                    <View style={styles.mapSection}>
                        <TouchableOpacity activeOpacity={0.9} onPress={abrirMapaNativo}>
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                    region={{
                                        latitude: evento.coordenadas.latitud,
                                        longitude: evento.coordenadas.longitud,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: evento.coordenadas.latitud,
                                            longitude: evento.coordenadas.longitud,
                                        }}
                                    />
                                </MapView>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mapButton} onPress={abrirMapaNativo}>
                            <Ionicons name="navigate-outline" size={20} color="#fff" />
                            <Text style={styles.mapButtonText}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerImage: { width: '100%', aspectRatio: 16 / 9 },
    content: { padding: 20 },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    date: { fontSize: 16, color: '#666', marginBottom: 16 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    description: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 20 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 8 },
    text: { fontSize: 16, color: '#444' },
    mapSection: { marginTop: 16, marginBottom: 40 },
    mapContainer: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
    map: { width: '100%', height: '100%' },
    mapButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
    mapButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});