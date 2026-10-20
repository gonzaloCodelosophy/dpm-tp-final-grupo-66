import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../../context/auth.context";
import { useCatalogo } from "../../hooks/use-catalogo";
import { useEventos } from "../../hooks/use-eventos";
import { useUbicacion } from "../../hooks/use-ubicacion";
import { distanciaMetros, textoDistancia } from "../../services/distancias";
import { actualizarEventos } from "../../services/eventos.service";
import { ImagenPersistente } from "../../components/imagen-persistente";
import {
  TarjetaEventoInicio,
  TarjetaLugarInicio,
} from "../../components/inicio/tarjetas-inicio";
import {
  AccesoInicio,
  BotonInicio,
  EstadoInicio,
  IlustracionRecorrido,
  TituloInicio,
} from "../../components/inicio/elementos-inicio";
import { colorsInicio as colors, fuenteTitulo } from "../../styles/inicio";
import { borderRadius, fontSize, spacing } from "../../styles/theme";

type PanelInicio =
  | "mapa"
  | "visitas"
  | "recorridos"
  | "clima"
  | "accesibilidad"
  | "emergencias"
  | "avisos";

const paneles = {
  mapa: {
    titulo: "Mapa de Colón",
    mensaje:
      "El mapa dentro de la app estará disponible próximamente. Mientras tanto, podés consultar la ubicación de los lugares en Explorar.",
  },
  visitas: {
    titulo: "Mis visitas",
    mensaje:
      "El registro de visitas estará disponible próximamente. Por ahora, podés descubrir los lugares y guardarlos en favoritos.",
  },
  recorridos: {
    titulo: "Armá tu recorrido",
    mensaje:
      "La creación de recorridos estará disponible próximamente. Podés ir guardando tus lugares favoritos para organizar tu paseo.",
  },
  clima: {
    titulo: "Clima",
    mensaje: "El pronóstico de Colón todavía no está disponible en la app.",
  },
  accesibilidad: {
    titulo: "Lugares accesibles",
    mensaje:
      "Estos lugares figuran como accesibles en el catálogo. Consultá el detalle antes de tu visita.",
  },
  emergencias: {
    titulo: "Emergencias",
    mensaje:
      "La información de contactos de emergencia todavía no está disponible en la app.",
  },
  avisos: {
    titulo: "Avisos de eventos",
    mensaje:
      "La preferencia de avisos estará disponible próximamente. Los recordatorios de eventos se siguen gestionando desde cada evento en la agenda.",
  },
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function HomeScreen() {
  const { usuario, status } = useAuth();
  const catalogo = useCatalogo();
  const agenda = useEventos();
  const ubicacion = useUbicacion();
  const [busqueda, setBusqueda] = useState("");
  const [panel, setPanel] = useState<PanelInicio | null>(null);
  const [avatarFallido, setAvatarFallido] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setAhora(Date.now());
    }, []),
  );

  const lugares = useMemo(
    () => (catalogo.datos?.lugares ?? []).filter((lugar) => lugar.activo),
    [catalogo.datos],
  );
  const nombre =
    status === "autenticado" ? usuario?.nombre.trim().split(/\s+/)[0] : null;
  const avatar = status === "autenticado" ? usuario?.avatarUrl : null;
  const texto = normalizar(busqueda);
  const resultadosLugares = texto
    ? lugares.filter((lugar) =>
        normalizar(`${lugar.nombre} ${lugar.descripcionCorta}`).includes(texto),
      )
    : [];
  const resultadosEventos = texto
    ? (agenda.datos ?? []).filter((evento) =>
        normalizar(`${evento.titulo} ${evento.descripcion}`).includes(texto),
      )
    : [];

  const cercanos = useMemo(() => {
    return lugares
      .map((lugar) => ({
        lugar,
        distancia: ubicacion.coordenadas
          ? distanciaMetros(ubicacion.coordenadas, lugar.coordenadas)
          : null,
      }))
      .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0))
      .slice(0, 2);
  }, [lugares, ubicacion.coordenadas]);

  const proximos = useMemo(
    () =>
      (agenda.datos ?? [])
        .filter(
          (evento) =>
            evento.estado !== "finalizado" &&
            Date.parse(evento.fin ?? evento.inicio) >= ahora,
        )
        .sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))
        .slice(0, 2),
    [agenda.datos, ahora],
  );

  const imagenPortada =
    lugares.find(
      (lugar) =>
        /puerto|costanera/i.test(lugar.nombre) && lugar.imagenes.length > 0,
    )?.imagenes[0] ??
    lugares.find((lugar) => lugar.imagenes.length > 0)?.imagenes[0];

  const abrirMapa = async () => {
    try {
      await Linking.openURL(
        "https://www.google.com/maps/search/?api=1&query=Col%C3%B3n%2C+Entre+R%C3%ADos%2C+Argentina",
      );
    } catch {
      Alert.alert("Cómo llegar", "No pudimos abrir el mapa. Intentá de nuevo.");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/logo-colon.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Colón, Entre Ríos"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mi perfil"
            onPress={() => router.push("/(tabs)/perfil")}
            style={styles.avatar}
          >
            {avatar && avatarFallido !== avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatarImagen}
                onError={() => setAvatarFallido(avatar)}
              />
            ) : (
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.secondary}
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.saludo}>
          {nombre ? `Hola, ${nombre} 👋` : "¡Hola! 👋"}
        </Text>
        <Text style={styles.subtitulo}>
          Descubrí todo lo que Colón tiene para vos
        </Text>

        <View style={styles.buscador}>
          <Ionicons name="search-outline" size={23} color={colors.primary} />
          <TextInput
            accessibilityLabel="Buscar lugares y eventos"
            placeholder="¿Qué querés descubrir?"
            placeholderTextColor={colors.textSecondary}
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.input}
            returnKeyType="search"
          />
          {busqueda.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
              onPress={() => setBusqueda("")}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {texto.length > 0 && (
          <View style={styles.resultados}>
            <Text style={styles.resultadosTitulo}>Resultados de búsqueda</Text>
            {(catalogo.cargando || agenda.cargando) && (
              <Text style={styles.textoSecundario}>Buscando...</Text>
            )}
            {resultadosLugares.map((lugar) => (
              <Pressable
                accessibilityRole="button"
                key={lugar.id}
                style={styles.resultado}
                onPress={() =>
                  router.push({
                    pathname: "/lugar/[id]",
                    params: { id: lugar.id },
                  })
                }
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.flex}>
                  <Text style={styles.resultadoTitulo}>{lugar.nombre}</Text>
                  <Text style={styles.textoSecundario}>Lugar</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ))}
            {resultadosEventos.map((evento) => (
              <Pressable
                accessibilityRole="button"
                key={evento.id}
                style={styles.resultado}
                onPress={() =>
                  router.push({
                    pathname: "/evento/[id]",
                    params: { id: evento.id },
                  })
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.green}
                />
                <View style={styles.flex}>
                  <Text style={styles.resultadoTitulo}>{evento.titulo}</Text>
                  <Text style={styles.textoSecundario}>Evento</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ))}
            {!catalogo.cargando &&
              !agenda.cargando &&
              resultadosLugares.length === 0 &&
              resultadosEventos.length === 0 && (
                <Text style={styles.textoSecundario}>
                  {catalogo.datos === null || agenda.datos === null
                    ? "No pudimos consultar todos los datos. Volvé a intentar cuando se hayan cargado."
                    : "No encontramos resultados. Probá con otro nombre."}
                </Text>
              )}
          </View>
        )}

        <View style={styles.accesos}>
          <AccesoInicio
            titulo="Lugares"
            icono="location-outline"
            color={colors.primary}
            fondo={colors.primaryLight}
            onPress={() => router.push("/(tabs)/explore")}
          />
          <AccesoInicio
            titulo="Eventos"
            icono="calendar-outline"
            color={colors.green}
            fondo={colors.greenLight}
            onPress={() => router.push("/(tabs)/agenda")}
          />
          <AccesoInicio
            titulo="Mapa"
            icono="map-outline"
            color={colors.secondary}
            fondo={colors.blueLight}
            onPress={() => setPanel("mapa")}
          />
          <AccesoInicio
            titulo="Visitas"
            icono="trail-sign-outline"
            color="#A87721"
            fondo={colors.yellowLight}
            onPress={() => setPanel("visitas")}
          />
        </View>

        <View style={styles.portada}>
          {imagenPortada ? (
            <ImagenPersistente
              url={imagenPortada}
              style={styles.imagenPortada}
            />
          ) : (
            <View style={[styles.imagenPortada, styles.portadaVacia]}>
              <Ionicons
                name="image-outline"
                size={48}
                color={colors.secondary}
              />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.65)"]}
            style={styles.degradado}
            pointerEvents="none"
          />
          <View style={styles.portadaContenido}>
            <Text style={styles.portadaTitulo}>Explorá Colón</Text>
            <Text style={styles.portadaSubtitulo}>Lugares cerca tuyo</Text>
            <BotonInicio
              texto="Ver lugares"
              onPress={() => router.push("/(tabs)/explore")}
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <TituloInicio
            titulo="Cerca tuyo"
            enlace="Ver todos"
            onPress={() => router.push("/(tabs)/explore")}
          />
          {catalogo.sinConexion && catalogo.datos !== null && (
            <Text style={styles.aviso}>
              Mostramos los lugares guardados. No pudimos actualizar el
              catálogo.
            </Text>
          )}
          {catalogo.cargando ? (
            <EstadoInicio titulo="Cargando lugares..." cargando />
          ) : catalogo.datos === null ? (
            <EstadoInicio
              titulo="No pudimos cargar los lugares"
              mensaje="Revisá tu conexión e intentá de nuevo."
              onPress={() => {
                void catalogo.reintentar();
              }}
            />
          ) : cercanos.length === 0 ? (
            <EstadoInicio titulo="Todavía no hay lugares disponibles" />
          ) : (
            cercanos.map(({ lugar, distancia }) => (
              <TarjetaLugarInicio
                key={lugar.id}
                lugar={lugar}
                categoria={
                  catalogo.datos?.categorias.find(
                    (categoria) => categoria.id === lugar.categoriaId,
                  )?.nombre ?? "Sin categoría"
                }
                distancia={
                  distancia === null ? null : textoDistancia(distancia)
                }
              />
            ))
          )}
          {ubicacion.permiso !== null && ubicacion.permiso !== "granted" && (
            <View style={styles.ubicacion}>
              <Ionicons
                name="location-outline"
                size={36}
                color={colors.secondary}
              />
              <View style={styles.flex}>
                <Text style={styles.ubicacionTexto}>
                  Activá tu ubicación para ver distancias reales
                </Text>
                <BotonInicio
                  texto={ubicacion.cargando ? "Esperá..." : "Permitir"}
                  secundario
                  disabled={ubicacion.cargando}
                  onPress={() => {
                    void ubicacion.solicitar();
                  }}
                />
              </View>
            </View>
          )}
          {ubicacion.error && (
            <EstadoInicio
              titulo="Ubicación no disponible"
              mensaje={ubicacion.error}
              onPress={() => {
                void ubicacion.solicitar();
              }}
            />
          )}
        </View>

        <View style={styles.seccion}>
          <TituloInicio
            titulo="Eventos próximos"
            enlace="Ver agenda"
            subrayado
            onPress={() => router.push("/(tabs)/agenda")}
          />
          {agenda.sinConexion && (
            <Text style={styles.aviso}>
              Mostramos los eventos guardados. No pudimos actualizar la agenda.
            </Text>
          )}
          {agenda.cargando ? (
            <EstadoInicio titulo="Cargando eventos..." cargando />
          ) : agenda.datos === null ? (
            <EstadoInicio
              titulo="No pudimos cargar los eventos"
              mensaje="Revisá tu conexión e intentá de nuevo."
              onPress={() => {
                void actualizarEventos();
              }}
            />
          ) : proximos.length === 0 ? (
            <EstadoInicio
              titulo="No hay eventos próximos por ahora"
              mensaje="Podés consultar los demás eventos en la agenda."
            />
          ) : (
            <View style={styles.eventos}>
              {proximos.map((evento) => (
                <TarjetaEventoInicio
                  key={evento.id}
                  evento={evento}
                  direccion={
                    evento.direccionLibre ??
                    lugares.find((lugar) => lugar.id === evento.lugarId)
                      ?.direccion ??
                    "Ubicación no disponible"
                  }
                />
              ))}
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.registrar}
          onPress={() => setPanel("visitas")}
        >
          <View style={styles.iconoVisita}>
            <Ionicons
              name="location-outline"
              size={26}
              color={colors.surface}
            />
          </View>
          <Text style={styles.registrarTexto}>Registrar visita</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.crearRecorrido}>
          <IlustracionRecorrido />
          <View style={styles.flex}>
            <Text style={styles.recorridoTitulo}>Armá tu recorrido</Text>
            <Text style={styles.recorridoDescripcion}>
              Guardá tus lugares favoritos y organizá tu paseo.
            </Text>
            <BotonInicio
              texto="Crear recorrido"
              onPress={() => setPanel("recorridos")}
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <TituloInicio titulo="Mi recorrido" />
          <View style={styles.recorridoVacio}>
            <Ionicons name="map-outline" size={38} color={colors.secondary} />
            <Text style={styles.recorridoTitulo}>Tu paseo empieza acá</Text>
            <Text style={styles.recorridoDescripcion}>
              Todavía no tenés un recorrido. Mientras preparamos esta función,
              guardá los lugares que querés conocer.
            </Text>
            <BotonInicio
              texto="Ver mis favoritos"
              onPress={() => router.push("/(tabs)/favoritos")}
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <TituloInicio titulo="Información útil" />
          <View style={styles.filaInfo}>
            <AccesoInicio
              compacto
              titulo="Cómo llegar"
              icono="car-outline"
              color={colors.primary}
              fondo={colors.primaryLight}
              onPress={() => {
                void abrirMapa();
              }}
            />
            <AccesoInicio
              compacto
              titulo="Clima"
              icono="sunny-outline"
              color={colors.green}
              fondo={colors.greenLight}
              onPress={() => setPanel("clima")}
            />
          </View>
          <View style={styles.filaInfo}>
            <AccesoInicio
              compacto
              titulo="Accesibilidad"
              icono="accessibility-outline"
              color={colors.secondary}
              fondo={colors.blueLight}
              onPress={() => setPanel("accesibilidad")}
            />
            <AccesoInicio
              compacto
              titulo="Emergencias"
              icono="call-outline"
              color="#A87721"
              fondo={colors.yellowLight}
              onPress={() => setPanel("emergencias")}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Avisos de eventos, integración pendiente"
            style={styles.notificaciones}
            onPress={() => setPanel("avisos")}
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color={colors.secondary}
            />
            <View style={styles.flex}>
              <Text style={styles.notificacionesTexto}>Avisos de eventos</Text>
              <Text style={styles.pendiente}>Próximamente</Text>
            </View>
            <Switch
              value={false}
              disabled
              accessibilityLabel="Avisos de eventos, próximamente"
              trackColor={{ false: colors.border }}
            />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={panel !== null}
        animationType="fade"
        onRequestClose={() => setPanel(null)}
      >
        <View style={styles.modalFondo}>
          <SafeAreaView style={styles.modalArea}>
            <View style={styles.modal} accessibilityViewIsModal>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>
                  {panel ? paneles[panel].titulo : ""}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={() => setPanel(null)}
                  style={styles.cerrar}
                >
                  <Ionicons name="close" size={24} color={colors.secondary} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.modalContenido}>
                <Text style={styles.modalTexto}>
                  {panel ? paneles[panel].mensaje : ""}
                </Text>
                {panel === "accesibilidad" &&
                  (catalogo.datos === null ? (
                    <Text style={styles.modalTexto}>
                      No pudimos cargar el catálogo. Intentá de nuevo desde
                      Inicio.
                    </Text>
                  ) : lugares.filter((lugar) => lugar.accesible).length ===
                    0 ? (
                    <Text style={styles.modalTexto}>
                      No hay lugares con accesibilidad informada.
                    </Text>
                  ) : (
                    lugares
                      .filter((lugar) => lugar.accesible)
                      .map((lugar) => (
                        <Pressable
                          accessibilityRole="button"
                          key={lugar.id}
                          style={styles.resultado}
                          onPress={() => {
                            setPanel(null);
                            router.push({
                              pathname: "/lugar/[id]",
                              params: { id: lugar.id },
                            });
                          }}
                        >
                          <Text style={[styles.resultadoTitulo, styles.flex]}>
                            {lugar.nombre}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.secondary}
                          />
                        </Pressable>
                      ))
                  ))}
                {panel === "recorridos" && (
                  <BotonInicio
                    texto="Ver mis favoritos"
                    onPress={() => {
                      setPanel(null);
                      router.push("/(tabs)/favoritos");
                    }}
                  />
                )}
                {(panel === "mapa" || panel === "visitas") && (
                  <BotonInicio
                    texto="Explorar lugares"
                    onPress={() => {
                      setPanel(null);
                      router.push("/(tabs)/explore");
                    }}
                  />
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: 18,
    paddingBottom: spacing.xl,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  logo: { width: 108, height: 58 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImagen: { width: "100%", height: "100%", borderRadius: 20 },
  saludo: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.secondary,
    letterSpacing: -0.7,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  buscador: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.secondary,
    fontSize: 14,
    paddingVertical: spacing.xs,
  },
  accesos: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  portada: {
    borderRadius: 18,
    overflow: "hidden",
    height: 225,
    backgroundColor: colors.blueLight,
  },
  imagenPortada: { width: "100%", height: "100%" },
  portadaVacia: { alignItems: "center", justifyContent: "center" },
  degradado: { ...StyleSheet.absoluteFillObject },
  portadaContenido: {
    position: "absolute",
    bottom: spacing.md,
    left: 16,
    right: 16,
    gap: spacing.sm,
  },
  portadaTitulo: {
    fontFamily: fuenteTitulo,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colors.surface,
  },
  portadaSubtitulo: {
    fontSize: 14,
    color: colors.surface,
    marginBottom: 6,
  },
  seccion: { marginTop: 20 },
  flex: { flex: 1, minWidth: 0 },
  ubicacion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.blueLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  ubicacionTexto: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  eventos: { flexDirection: "row", gap: 12, alignItems: "stretch" },
  aviso: {
    padding: spacing.sm,
    fontSize: fontSize.caption,
    lineHeight: 19,
    color: colors.textSecondary,
    backgroundColor: colors.blueLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  registrar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "#FFDDD3",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  iconoVisita: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  registrarTexto: {
    flex: 1,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  crearRecorrido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "#FFDDD3",
    borderRadius: borderRadius.md,
  },
  recorridoTitulo: { fontSize: 17, fontWeight: "600", color: colors.secondary },
  recorridoDescripcion: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginVertical: spacing.sm,
  },
  recorridoVacio: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  filaInfo: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  notificaciones: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  notificacionesTexto: { fontSize: fontSize.caption, color: colors.secondary },
  pendiente: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultados: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  resultadosTitulo: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.secondary,
  },
  resultado: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },
  resultadoTitulo: { fontSize: fontSize.body, color: colors.secondary },
  textoSecundario: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(7, 59, 83, 0.35)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalArea: {
    maxHeight: "90%",
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  modal: {
    flexShrink: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalTitulo: {
    flex: 1,
    fontFamily: fuenteTitulo,
    fontSize: 25,
    color: colors.secondary,
    fontWeight: "700",
  },
  cerrar: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContenido: { gap: spacing.md },
  modalTexto: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 24,
  },
});
