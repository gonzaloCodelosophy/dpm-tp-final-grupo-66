# Inicio – Mi Ciudad Colón

Referencia visual: `referencias/inicio.png`. Es una única pantalla con scroll vertical. El logo recibido se conserva en `assets/images/logo-colon.svg`; el PNG usado por la app es la imagen original que estaba incrustada en ese SVG, sin redibujarla.

## Implementación

- `src/app/(tabs)/index.tsx`: Inicio, búsqueda local de lugares y eventos, perfil, secciones y paneles informativos.
- `src/components/inicio`: encabezados, accesos, botones, estados y variantes de tarjetas para Inicio. Las tarjetas reutilizan `ImagenPersistente` y `BotonLugarFavorito`.
- `src/styles/inicio.ts`: paleta específica de la maqueta. No cambia los colores de otras pantallas. Los títulos usan Georgia en iOS y serif del sistema en Android; el texto conserva la fuente del proyecto.
- `src/hooks/use-ubicacion.ts`: consulta de permisos sin solicitarlos al abrir Inicio; la solicitud se hace con Permitir. Al volver de Ajustes, comprueba el permiso. No solicita ubicación en segundo plano.
- `src/services/distancias.ts`: distancias aproximadas en línea recta con coordenadas reales, expresadas en metros o kilómetros. No son distancias de recorrido por calles.

Los lugares inactivos no aparecen. Si hay ubicación disponible, los lugares se ordenan por distancia. Sin ubicación se mantiene el orden del catálogo y se muestra la dirección, sin inventar metros. Los eventos próximos se ordenan por inicio, se excluyen los finalizados y se consideran las fechas de fin cuando están disponibles. El saludo y el avatar provienen de la sesión; para visitantes se muestra un saludo genérico.

La búsqueda consulta los datos ya cargados, admite mayúsculas y acentos y abre el detalle de lugares o eventos. No agrega endpoints. Conserva las cinco pestañas existentes; únicamente el indicador de Inicio adopta el coral de la referencia.

## Integraciones pendientes

No existían pantallas o servicios cliente de mapa, visitas o recorridos. Los accesos abren paneles que informan que estarán disponibles próximamente y ofrecen una acción existente (Explorar o Favoritos). El backend demo tiene endpoints de visitas, pero no se agregó un flujo de registro parcial desde Inicio.

Mi recorrido muestra un estado vacío; no dibuja un recorrido ficticio ni inventa paradas o kilómetros. La ilustración de Crear recorrido es decorativa.

Clima y Emergencias muestran su indisponibilidad; no se agregan pronósticos ni números sin una fuente configurada. Cómo llegar abre una búsqueda de Colón, Entre Ríos, en Google Maps. Accesibilidad muestra los lugares que el catálogo marca como accesibles.

El proyecto no tiene una preferencia de avisos de eventos. El interruptor queda deshabilitado y marcado Próximamente; no representa permisos del teléfono ni inventa una preferencia. El botón de agenda existente sigue administrando sus recordatorios como antes.

## Fotografías faltantes

Los datos disponibles contienen URLs de `placehold.co` y no hay fotos turísticas locales en assets. Para lograr la fidelidad fotográfica de la referencia hacen falta:

- Fotografía de Colón/costanera para el banner.
- Fotografías reales de Termas y Playa Norte para sus registros del catálogo.
- Fotografías de los eventos cargados en la agenda.
- Foto de perfil del usuario, si se quiere mostrar una en vez del ícono cuando avatarUrl es null.

Inicio utiliza las imágenes de los registros reales; no descarga ni sustituye imágenes por otras genéricas. La maqueta adjunta se conserva como referencia y no se recorta para simular contenido real.

## Verificación

TypeScript pasó sin errores. Lint pasó con las tres advertencias previas de las pantallas de autenticación. Las ocho pruebas de Inicio y favoritos pasaron. Las pruebas `node --test scripts/inicio.test.cjs scripts/favoritos.test.cjs` cubren distancias y persistencia simulada de favoritos. Las exportaciones Android e iOS finalizaron correctamente y comprueban que Metro genera los paquetes; no sustituye una ejecución en un teléfono.

La revisión visual interactiva quedó pendiente: no hay navegador ni dispositivo conectado en este entorno. En Expo Go comprobar scroll, navegación de las tarjetas, fuente ampliada, permisos concedidos/denegados, favoritos y los estados sin datos. Comparar la composición con `referencias/inicio.png`, teniendo en cuenta las fotos e integraciones faltantes.
