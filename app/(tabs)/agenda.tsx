import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Evento } from '../../types/evento';
import { obtenerEventos } from '../../services/eventos.service';
import TarjetaEvento from '../../components/tarjeta-evento';

export default function AgendaScreen() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const router = useRouter(); // Hook de enrutamiento

    useEffect(() => {
        obtenerEventos()
            .then((data) => {
                const ordenados = data.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
                setEventos(ordenados);
            })
            .catch((error) => console.error("Error al cargar eventos:", error));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Agenda de Eventos</Text>
            <FlatList
                data={eventos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <TarjetaEvento 
                        evento={item}
                        onPress={() => router.push(`/evento/${item.id}`)} 
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 40, // Espacio para la barra de estado si no hay header
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        color: '#111',
    },
    listContainer: {
        paddingVertical: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    }
});