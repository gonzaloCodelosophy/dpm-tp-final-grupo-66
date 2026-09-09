# Estructura del proyecto Mi Ciudad Colón

## app

Contiene las pantallas y rutas de la aplicación.

El proyecto utiliza Expo Router. Los archivos incluidos en esta carpeta
representan pantallas o configuraciones de navegación.

- `_layout.tsx`: configura la navegación general.
- `index.tsx`: representa la pantalla inicial.
- `modal.tsx`: contiene una pantalla presentada como modal.

## components

Contiene componentes visuales reutilizables.

Se creó `EventCard.tsx`, una tarjeta que muestra la imagen, fecha, nombre,
ubicación, horario y categoría de un evento.

La tarjeta recibe los datos mediante propiedades. No accede directamente a
datos falsos ni a la API.

## assets

Contiene imágenes, íconos y otros recursos visuales de la aplicación.

Dentro de `assets/images` se encuentran los íconos predeterminados de Expo.
Posteriormente se incorporarán el logo, el ícono y la pantalla de presentación
de Mi Ciudad Colón.

## src

Contiene los recursos internos, modelos de datos, estilos y lógica de acceso a
la información.

### src/styles

Contiene los valores visuales compartidos.

El archivo `theme.ts` centraliza los colores, tamaños de texto, espaciados y
bordes redondeados de la aplicación.

### src/types

Contendrá los tipos de TypeScript definidos en el PRD.

Los tipos se escribirán una sola vez y no deberán modificarse cuando llegue la
API de la cátedra.

### src/mocks

Contendrá los datos falsos utilizados mientras la API no esté disponible.

Los datos deberán respetar los tipos definidos en `src/types`.

### src/services

Contendrá la capa de servicios encargada de obtener la información.

Las pantallas no importarán los mocks directamente. Los servicios serán
asíncronos desde el comienzo. Inicialmente devolverán datos falsos y,
posteriormente, realizarán las solicitudes a la API.

## Propuesta visual

La identidad visual toma como referencia la ciudad de Colón y las maquetas
iniciales.

- Coral para acciones, botones y fechas.
- Verde petróleo para títulos e identidad.
- Verde natural para ubicación y turismo.
- Amarillo para actividades y agenda.
- Crema para el fondo general.
- Blanco para tarjetas y superficies.

Se proponen Lora para títulos destacados e Inter para textos y botones.
Durante esta primera etapa se utiliza la tipografía predeterminada del sistema.

La interfaz utilizará textos legibles, contraste alto y botones grandes,
teniendo en cuenta que la aplicación puede usarse al aire libre, caminando
y por personas con tamaños de letra ampliados.