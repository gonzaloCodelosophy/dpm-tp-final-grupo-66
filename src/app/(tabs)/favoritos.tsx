import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCatalogo } from '../../hooks/use-catalogo';
import { useFavoritos } from '../../hooks/use-favoritos';
import { TarjetaLugar } from '../../components/tarjeta-lugar';
import { EstadoCatalogo } from '../../components/estado-catalogo';
import { EstadoPantalla } from '../../components/estado-pantalla';
import { colors, fontSize, spacing } from '../../styles/theme';

export default function FavoritosScreen() {
  const { datos, cargando, sinConexion, error, reintentar } = useCatalogo();
  const lugares = datos?.lugares ?? [];
  const guardados = useFavoritos(lugares.map(lugar => lugar.id));
  const favoritos = lugares.filter(lugar => lugar.activo && guardados.favoritos.includes(lugar.id));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.titulo}>Mis favoritos</Text>
      <Text style={styles.descripcion}>Tus lugares guardados en este dispositivo. No necesitás iniciar sesión.</Text>
      {cargando || guardados.cargando ? <EstadoPantalla tipo="cargando" /> : datos === null ? (
        <EstadoPantalla tipo={sinConexion ? 'sinConexion' : 'error'} onPress={() => { void reintentar(); }} />
      ) : guardados.error ? (
        <EstadoPantalla tipo="error" titulo="No pudimos leer tus favoritos" mensaje="Intentá de nuevo en unos momentos." onPress={guardados.reintentar} />
      ) : (
        <>
          <EstadoCatalogo sinConexion={sinConexion} error={error !== null} />
          <FlatList
            data={favoritos}
            keyExtractor={lugar => lugar.id}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => <TarjetaLugar lugar={item} nombreCategoria={datos.categorias.find(categoria => categoria.id === item.categoriaId)?.nombre ?? 'Sin categoría'} onPress={() => router.push({ pathname: '/lugar/[id]', params: { id: item.id } })} />}
            ListEmptyComponent={<EstadoPantalla tipo="vacio" titulo="Todavía no tenés favoritos" mensaje="Tocá el corazón de un lugar para guardarlo. Acá aparecen los lugares que siguen disponibles." accion="Explorar lugares" onPress={() => router.push('/(tabs)/explore')} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titulo: { margin: spacing.md, fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  descripcion: { marginHorizontal: spacing.md, marginBottom: spacing.md, fontSize: fontSize.body, color: colors.textSecondary },
  lista: { padding: spacing.md, flexGrow: 1 },
});
