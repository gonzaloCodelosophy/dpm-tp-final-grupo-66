import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTema } from '../context/tema.context';
import { distanciaMetros, textoDistancia } from '../services/distancias';
import type { Lugar } from '../types/Lugar';
import type { Coordenadas } from '../types/Coordenadas';

// Variante del panel de lugares del mapa: muestra el catálogo y permite elegirlo.
export function SelectorLugarVisita({ lugares, categorias, posicion, onSeleccionar, hayMas, cargando, onCargarMas }: {
  lugares: Lugar[];
  categorias: { id: string; color: string }[];
  posicion: Coordenadas | null;
  onSeleccionar: (lugar: Lugar) => void;
  hayMas: boolean;
  cargando: boolean;
  onCargarMas: () => void;
}) {
  const { colorsInicio: colors } = useTema();
  const [busqueda, setBusqueda] = useState('');
  const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const visibles = lugares.filter(lugar => lugar.activo && normalizar(lugar.nombre).includes(normalizar(busqueda.trim())));

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        accessibilityLabel="Buscar lugar por nombre"
        placeholder="Buscar por nombre…"
        placeholderTextColor={colors.textSecondary}
        value={busqueda}
        onChangeText={setBusqueda}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        style={[styles.busqueda, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
      />
      <ScrollView style={styles.lista} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        {visibles.map(lugar => (
          <View key={lugar.id} style={[styles.fila, { borderBottomColor: colors.border }]}>
            <Ionicons name="location-outline" size={22} color={categorias.find(categoria => categoria.id === lugar.categoriaId)?.color ?? colors.primary} />
            <View style={styles.detalle}>
              <Text style={[styles.nombre, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail" accessibilityLabel={lugar.nombre}>{lugar.nombre}</Text>
              {posicion && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{textoDistancia(distanciaMetros(posicion, lugar.coordenadas))}</Text>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar ${lugar.nombre}`} onPress={() => onSeleccionar(lugar)} style={[styles.boton, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Seleccionar</Text>
            </Pressable>
          </View>
        ))}
        {visibles.length === 0 && <Text style={{ color: colors.textSecondary }}>{busqueda.trim() ? 'No encontramos lugares con ese nombre.' : 'No hay lugares disponibles.'}</Text>}
      </ScrollView>
      {cargando ? <ActivityIndicator color={colors.primary} style={styles.cargando} /> : hayMas && (
        <Pressable accessibilityRole="button" onPress={onCargarMas} style={styles.cargando}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Cargar más lugares</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 20, padding: 14, marginVertical: 16 },
  busqueda: { minHeight: 58, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, fontSize: 15 },
  lista: { maxHeight: 280 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1 },
  detalle: { flex: 1, minWidth: 0, gap: 4 }, nombre: { fontSize: 14, fontWeight: '600' },
  boton: { paddingHorizontal: 8, paddingVertical: 10, borderRadius: 12 },
  cargando: { alignItems: 'center', paddingTop: 14 },
});
