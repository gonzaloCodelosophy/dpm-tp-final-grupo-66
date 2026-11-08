import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCatalogo } from '../../hooks/use-catalogo';
import { useFavoritos } from '../../hooks/use-favoritos';
import { TarjetaLugar } from '../../components/tarjeta-lugar';
import { EstadoCatalogo } from '../../components/estado-catalogo';
import { EstadoPantalla } from '../../components/estado-pantalla';
import { useAuth } from '../../context/auth.context';
import { colors, fontSize, spacing } from '../../styles/theme';

export default function FavoritosScreen() {
  const { usuario, status } = useAuth();
  const { datos, cargando, sinConexion, error, reintentar } = useCatalogo();
  const lugares = datos?.lugares ?? [];
  const autenticado = status === 'autenticado' && usuario !== null;
  const guardados = useFavoritos(autenticado ? lugares.map(lugar => lugar.id) : []);
  const favoritos = lugares.filter(lugar => lugar.activo && guardados.favoritos.includes(lugar.id));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.titulo}>Mis favoritos</Text>
      {autenticado && <Text style={styles.descripcion}>Tus lugares guardados aparecen acá.</Text>}
      {status === 'cargando' || cargando || (autenticado && guardados.cargando) ? <EstadoPantalla tipo="cargando" /> : !autenticado ? (
        <EstadoPantalla
          tipo="vacio"
          titulo={status === 'biometria_requerida' ? 'Desbloqueá tu sesión' : 'Iniciá sesión para ver tus favoritos'}
          mensaje={status === 'biometria_requerida' ? 'Autenticá tu sesión para consultar tus lugares guardados.' : 'Necesitás iniciar sesión para guardar y ver lugares favoritos.'}
          accion={status === 'biometria_requerida' ? undefined : 'Iniciar sesión'}
          onPress={status === 'biometria_requerida' ? undefined : () => router.push('/(auth)/login' as any)}
        />
      ) : datos === null ? (
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
