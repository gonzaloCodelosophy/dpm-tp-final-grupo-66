import { useEffect, useState } from 'react';
import { Image, type ImageProps } from 'expo-image';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import { descargarImagen, obtenerImagenLocal, observarImagenes, urlImagenRemota } from '../services/imagenes.service';

export function ImagenPersistente({ url, style, contentFit = 'cover' }: { url: string; style: ImageProps['style']; contentFit?: ImageProps['contentFit'] }) {

  const [local, setLocal] = useState<{ url: string; uri: string } | null>(null);
  const [fallida, setFallida] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;
    setFallida(null);

    const leer = () => {
      void obtenerImagenLocal(url).then(uri => {
        if (activa) {
          setLocal(uri ? { url, uri } : null);
          if (uri) setFallida(null);
        }
      }).catch(() => undefined);
    };

    leer();

    const cancelar = observarImagenes(actual => {
      if (actual === url) leer();
    });

    void descargarImagen(url).catch(() => undefined);

    return () => {
      activa = false;
      cancelar();
    };
  }, [url]);

  const uri = local?.url === url ? local.uri : urlImagenRemota(url);
  if (fallida === uri) return <View style={[style as StyleProp<ViewStyle>, { backgroundColor: '#eaeaea', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#666', textAlign: 'center' }}>Imagen no disponible</Text></View>;

  return <Image source={{ uri }} style={style} contentFit={contentFit} cachePolicy="disk" onError={() => setFallida(uri)} />;
}
