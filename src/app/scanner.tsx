import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { CheckCircle, RefreshCcw, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Alert, Image, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Card, ScrollView, SizableText, Spinner, XStack, YStack,
} from 'tamagui';
import { RootState } from '../store';
import { useGetProductosQuery } from '../store/api';
import { addItem } from '../store/cartSlice';

type AIResult = {
  name: string
  dosage: string
  prescribed_units: number
  unit_type: string
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AIResult[] | null>(null);

  const cameraRef = useRef<CameraView>(null);

  const dispatch = useDispatch();
  const sucursalId = useSelector((state: RootState) => state.cart.sucursalId);
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: storeData } = useGetProductosQuery(
    { sucursalId: sucursalId! },
    { skip: !sucursalId },
  );

  if (!permission) {
    return (
      <YStack f={1} jc="center" ai="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (!permission.granted) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4">
        <SizableText ta="center" size="$5">
          Necesitamos permisos de cámara para escanear tus recetas médicas.
        </SizableText>
        <Button onPress={requestPermission} bg="$color" color="white">
          Otorgar Permiso
        </Button>
      </YStack>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1, base64: true });
        if (photo) setPhotoUri(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'No se pudo capturar la imagen.');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!photoUri) return;
    setIsAnalyzing(true);
    try {
      const uploadResult = await FileSystem.uploadAsync(
        'https://pharmacy.lonk.dev/api/ai/scan-prescription',
        photoUri,
        {
          httpMethod: 'POST',
          uploadType:
            (FileSystem as any).UploadType?.MULTIPART
            ?? (FileSystem as any).FileSystemUploadType?.MULTIPART
            ?? 1,
          fieldName: 'file',
          mimeType: 'image/jpeg',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (uploadResult.status !== 200) {
        throw new Error(`HTTP error! status: ${uploadResult.status}`);
      }

      const data = JSON.parse(uploadResult.body);
      if (data.success && data.order) {
        setResults(data.order);
      } else {
        Alert.alert('Aviso', 'No se encontraron medicamentos legibles en la receta.');
        setPhotoUri(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al analizar la receta.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findMatchingProduct = (medName: string) => {
    if (!storeData?.productos) return null;
    const nameLower = medName.toLowerCase();

    return storeData.productos.find((p: any) => p.nombre.toLowerCase().includes(nameLower));
  };

  const handleAddToCart = (product: any, prescribedUnits: number) => {
    // Basic logic: Assume 1 box = 10 units for this prototype unless specified
    // In a real app, the product DB would have `units_per_box`
    const unitsPerBox = 10;
    const boxesNeeded = Math.ceil(prescribedUnits / unitsPerBox);

    for (let i = 0; i < boxesNeeded; i += 1) {
      dispatch(
        addItem({
          productoId: product.id,
          nombre: product.nombre,
          precio: product.precio_venta,
        }),
      );
    }

    Alert.alert(
      '¡Agregado!',
      `Se agregaron ${boxesNeeded} caja(s) de ${product.nombre} al carrito.`,
    );
  };

  // 1. Review Results Mode
  if (results) {
    return (
      <YStack f={1} bg="$background" pt="$8">
        <XStack p="$4" jc="space-between" ai="center">
          <SizableText size="$6" fontWeight="bold">
            Resultados
          </SizableText>
          <Button icon={X} circular onPress={() => router.back()} />
        </XStack>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {results.map((med, index) => {
            const matchedProduct = findMatchingProduct(med.name);
            return (
              <Card
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                borderWidth={1}
                borderColor="$borderColor"
                p="$4"
                gap="$2"
                bg="white"
              >
                <SizableText size="$5" fontWeight="bold" color="$color">
                  Receta:
                  {' '}
                  {med.name}
                  {' '}
                  {med.dosage}
                </SizableText>
                <SizableText>
                  Cantidad Recetada:
                  {' '}
                  {med.prescribed_units}
                  {' '}
                  {med.unit_type}
                </SizableText>

                <YStack mt="$2" p="$3" bg="$backgroundHover" borderRadius="$2" gap="$2">
                  <SizableText size="$3" fontWeight="bold" color="$colorHover">
                    Coincidencia en Tienda:
                  </SizableText>
                  {matchedProduct ? (
                    <>
                      <SizableText>{matchedProduct.nombre}</SizableText>
                      <SizableText color="$colorHover">
                        Bs.
                        {' '}
                        {matchedProduct.precio_venta.toFixed(2)}
                      </SizableText>
                      <Button
                        mt="$2"
                        bg="$color"
                        color="white"
                        icon={CheckCircle}
                        onPress={() => handleAddToCart(matchedProduct, med.prescribed_units)}
                      >
                        Añadir al Carrito
                      </Button>
                    </>
                  ) : (
                    <SizableText color="red">No disponible en esta sucursal.</SizableText>
                  )}
                </YStack>
              </Card>
            );
          })}
        </ScrollView>
      </YStack>
    );
  }

  // 2. Photo Preview Mode
  if (photoUri) {
    return (
      <YStack f={1} bg="black">
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
        />

        {isAnalyzing ? (
          <YStack
            f={1}
            jc="center"
            ai="center"
            style={StyleSheet.absoluteFill}
            bg="rgba(0,0,0,0.6)"
          >
            <Spinner size="large" color="white" />
            <SizableText color="white" mt="$4" size="$5" fontWeight="bold">
              Analizando receta con IA...
            </SizableText>
          </YStack>
        ) : (
          <XStack pos="absolute" bottom={40} left={0} right={0} jc="space-evenly" ai="center">
            <Button
              size="$5"
              circular
              icon={RefreshCcw}
              onPress={() => setPhotoUri(null)}
              bg="rgba(255,255,255,0.3)"
              color="white"
            />
            <Button size="$5" bg="$color" color="white" icon={CheckCircle} onPress={handleAnalyze}>
              Analizar Receta
            </Button>
          </XStack>
        )}
      </YStack>
    );
  }

  // 3. Camera Capture Mode
  return (
    <YStack f={1} bg="black">
      <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef} />

      {/* Close Button */}
      <YStack pos="absolute" top={50} right={20}>
        <Button
          circular
          icon={X}
          bg="rgba(0,0,0,0.5)"
          color="white"
          onPress={() => router.back()}
        />
      </YStack>

      {/* Capture Button */}
      <YStack pos="absolute" bottom={40} left={0} right={0} ai="center">
        <TouchableOpacity
          onPress={handleTakePicture}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: 'rgba(255,255,255,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <YStack w={54} h={54} borderRadius={27} bg="white" />
        </TouchableOpacity>
      </YStack>
    </YStack>
  );
}
