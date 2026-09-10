import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Evento } from '../types/evento';

interface TarjetaEventoProps {
    evento: Evento;
    onPress: () => void;
}

export default function TarjetaEvento({ evento, onPress }: TarjetaEventoProps) {
    if (!evento || !evento.inicio) return null;

    const fechaObj = new Date(evento.inicio);
    const textoFecha = evento.inicio.includes("T00:00:00")
        ? `${fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} - Sin horario`
        : fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·');

    // Asumimos 'Programado' por defecto si el backend no lo envía
    const estado = evento.estado || 'Programado';

    const getBadgeStyle = () => {
        if (estado === 'cancelado') return [styles.badge, styles.badgeCancelado];
        if (estado === 'suspendido') return [styles.badge, styles.badgeSuspendido];
        return [styles.badge, styles.badgeProgramado];
    };

    return (
        <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.8}>
            {evento.imagenUrl ? (
                <Image source={{ uri: evento.imagenUrl }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Ionicons name="image-outline" size={32} color="#ccc" />
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{evento.titulo}</Text>

                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{textoFecha}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.detailText} numberOfLines={1}>{evento.direccionLibre || 'Colón, Entre Ríos'}</Text>
                </View>

                <View style={getBadgeStyle()}>
                    <Text style={styles.badgeText}>{estado.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tarjeta: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    image: {
        width: 100,
        height: '100%',
    },
    placeholder: {
        backgroundColor: '#eaeaea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#555',
        marginLeft: 6,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 6,
    },
    badgeProgramado: { backgroundColor: '#17A2B8' },
    badgeSuspendido: { backgroundColor: '#FFC107' },
    badgeCancelado: { backgroundColor: '#DC3545' },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    chevronContainer: {
        justifyContent: 'center',
        paddingRight: 12,
    }
});