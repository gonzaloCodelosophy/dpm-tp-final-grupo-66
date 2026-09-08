import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Evento } from '../types/evento';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface TarjetaEventoProps {
    evento: Evento;
    onPress: () => void;
}

export default function TarjetaEvento({ evento, onPress }: TarjetaEventoProps) {
    const fechaObj = new Date(evento.inicio);
    const esSinHorario = evento.inicio.includes("T00:00:00");

    const textoFecha = esSinHorario
        ? `${fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} - Sin horario`
        : fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.8}>
            {evento.imagenUrl ? (
                <Image
                    source={{ uri: evento.imagenUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Ionicons name="image-outline" size={32} color="#ccc" />
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{evento.titulo}</Text>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.date}>{textoFecha}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tarjeta: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: '100%',
        aspectRatio: 4 / 3,
    },
    placeholder: {
        backgroundColor: '#eaeaea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        lineHeight: 18,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4
    },
});