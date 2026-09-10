import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Linking, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Evento } from '../../types/evento';
import { obtenerEventoPorId } from '../../services/eventos.service';
import BotonEventoFavorito from '../../components/boton-evento-favorito';
import * as Notifications from 'expo-notifications';

export default function PantallaDetalleEvento() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
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

    if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
    if (!evento) return <View style={styles.center}><Text>Evento no encontrado.</Text></View>;

    const fechaObj = new Date(evento.inicio);
    const textoFecha = evento.inicio.includes("T00:00:00")
        ? `${fechaObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} · Sin horario`
        : fechaObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·');

    const estado = evento.estado || 'Programado';

    const abrirMapaNativo = () => {
        if (!evento?.coordenadas) return;
        const { latitud, longitud } = evento.coordenadas;
        const label = encodeURIComponent(evento.titulo);
        const latLng = `${latitud},${longitud}`;
        const url = Platform.select({ ios: `maps:0,0?q=${label}@${latLng}`, android: `geo:0,0?q=${latLng}(${label})` });
        if (url) Linking.openURL(url).catch(err => console.error("Error al abrir los mapas", err));
    };

    // ! ACORDARSE DE SACAR ESTO ANTES DE HACER EL BUILD
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: false,
                    headerTintColor: '#111',
                    headerBackTitle: ''
                }}
            />

            {evento.imagenUrl ? (
                <Image source={{ uri: evento.imagenUrl }} style={styles.headerImage} resizeMode="cover" />
            ) : (
                <View style={[styles.headerImage, { backgroundColor: '#ccc' }]} />
            )}

            <View style={styles.content}>
                <Text style={styles.title}>{evento.titulo}</Text>

                <View style={[styles.badge, estado === 'cancelado' ? styles.badgeCancelado : estado === 'suspendido' ? styles.badgeSuspendido : styles.badgeProgramado]}>
                    <Text style={styles.badgeText}>{estado.toUpperCase()}</Text>
                </View>

                {estado === 'suspendido' && (
                    <View style={[styles.warningBox, { backgroundColor: '#FFF3CD', borderColor: '#FFEEBA' }]}>
                        <Ionicons name="alert-circle" size={24} color="#856404" />
                        <View style={styles.warningTextContainer}>
                            <Text style={[styles.warningTitle, { color: '#856404' }]}>Evento suspendido</Text>
                            <Text style={[styles.warningDesc, { color: '#856404' }]}>La actividad se reprogramará. Te avisaremos cuando haya una nueva fecha.</Text>
                        </View>
                    </View>
                )}

                {estado === 'cancelado' && (
                    <View style={[styles.warningBox, { backgroundColor: '#F8D7DA', borderColor: '#F5C6CB' }]}>
                        <Ionicons name="close-circle" size={24} color="#721C24" />
                        <View style={styles.warningTextContainer}>
                            <Text style={[styles.warningTitle, { color: '#721C24' }]}>Evento cancelado</Text>
                            <Text style={[styles.warningDesc, { color: '#721C24' }]}>Esta actividad no se realizará.</Text>
                        </View>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>{textoFecha}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>{evento.direccionLibre || 'Colón, Entre Ríos'}</Text>
                </View>

                {estado === 'programado' && (
                    <>
                        <Text style={styles.subtitle}>Sobre el evento</Text>
                        <Text style={styles.description}>{evento.descripcion}</Text>
                    </>
                )}

                <View style={styles.actionContainer}>
                    {estado === 'programado' && (
                        <>
                            <TouchableOpacity style={[styles.mainButton, styles.buttonPrimary]} onPress={abrirMapaNativo}>
                                <Ionicons name="location-outline" size={20} color="#fff" />
                                <Text style={styles.buttonPrimaryText}>Cómo llegar</Text>
                            </TouchableOpacity>
                            <BotonEventoFavorito evento={evento} />
                        </>
                    )}

                    {estado === 'suspendido' && (
                        <View style={[styles.mainButton, styles.buttonDisabled]}>
                            <Text style={styles.buttonDisabledText}>Fecha por confirmar</Text>
                        </View>
                    )}

                    {estado === 'cancelado' && (
                        <>
                            <View style={[styles.mainButton, styles.buttonDisabled]}>
                                <Text style={styles.buttonDisabledText}>Evento no disponible</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                                <Text style={styles.backLinkText}>Volver a la agenda</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* BOTÓN TEMPORAL PARA PRUEBAS */}
                    <TouchableOpacity
                        style={{ backgroundColor: '#DC3545', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 }}
                        onPress={probarNotificacion}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            🧪 Probar Notificación de {evento.titulo}
                        </Text>
                    </TouchableOpacity>
                </View>

                {evento.coordenadas && estado === 'programado' && (
                    <View style={styles.mapSection}>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
                                region={{
                                    latitude: evento.coordenadas.latitud,
                                    longitude: evento.coordenadas.longitud,
                                    latitudeDelta: 0.005, longitudeDelta: 0.005,
                                }}
                            >
                                <Marker coordinate={{ latitude: evento.coordenadas.latitud, longitude: evento.coordenadas.longitud }} />
                            </MapView>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerImage: { width: '100%', height: 250 },
    content: { padding: 20, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 12 },

    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
    badgeProgramado: { backgroundColor: '#17A2B8' },
    badgeSuspendido: { backgroundColor: '#FFC107' },
    badgeCancelado: { backgroundColor: '#DC3545' },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    warningBox: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20, alignItems: 'flex-start' },
    warningTextContainer: { marginLeft: 12, flex: 1 },
    warningTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    warningDesc: { fontSize: 14, lineHeight: 20 },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoText: { fontSize: 16, color: '#444', marginLeft: 10 },

    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#111' },
    description: { fontSize: 16, lineHeight: 24, color: '#444', marginBottom: 24 },

    actionContainer: { gap: 12, marginVertical: 20 },
    mainButton: { width: '100%', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonPrimary: { backgroundColor: '#FF6B35' },
    buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    buttonDisabled: { backgroundColor: '#E0E0E0' },
    buttonDisabledText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
    backLink: { alignItems: 'center', marginTop: 8 },
    backLinkText: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold' },

    mapSection: { marginTop: 10 },
    mapContainer: { width: '100%', height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
    map: { width: '100%', height: '100%' },
});