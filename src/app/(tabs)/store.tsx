import { router } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import {
  Camera as CameraIcon, MapPin, Mic, MicOff, Search,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Card, Input, ScrollView, SizableText, Spinner, XStack, YStack,
} from 'tamagui';
import { RootState } from '../../store';
import { useGetProductosQuery, useGetSucursalesQuery } from '../../store/api';
import { addItem, setSucursal } from '../../store/cartSlice';

export default function StorefrontScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch();
  const sucursalId = useSelector((state: RootState) => state.cart.sucursalId);

  // Fetch branches
  const { data: sucursalesData } = useGetSucursalesQuery({});
  const currentSucursal = sucursalesData?.sucursales?.find((s: any) => s.id === sucursalId);

  React.useEffect(() => {
    if (!sucursalId && sucursalesData?.sucursales?.length > 0) {
      dispatch(setSucursal(sucursalesData.sucursales[0].id));
    }
  }, [sucursalId, sucursalesData, dispatch]);

  const {
    data, isLoading, isFetching, refetch,
  } = useGetProductosQuery(
    { sucursalId: sucursalId! },
    { skip: !sucursalId },
  );

  const handleAddToCart = (producto: any) => {
    dispatch(
      addItem({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_venta,
      }),
    );
  };

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setSearchInput(transcript);
      setActiveSearchQuery(transcript);
    }
  });

  const handleVoiceSearch = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    if (Platform.OS !== 'web') {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Se requieren permisos de micrófono para la búsqueda por voz.');
        return;
      }
    }

    ExpoSpeechRecognitionModule.start({ lang: 'es-ES', interimResults: true });
  };

  const productos = data?.productos || [];
  const filteredProducts = productos.filter(
    (p: any) => p.nombre.toLowerCase().includes(activeSearchQuery.toLowerCase()),
  );

  const renderContent = () => {
    if (!sucursalId) {
      return (
        <YStack p="$4" ai="center">
          <Spinner size="large" color="$color" />
          <SizableText mt="$2" color="$colorHover">
            Cargando farmacia...
          </SizableText>
        </YStack>
      );
    }
    if (isLoading) {
      return (
        <YStack p="$4" ai="center">
          <Spinner size="large" color="$color" />
        </YStack>
      );
    }
    if (filteredProducts.length > 0) {
      return filteredProducts.map((p: any) => (
        <Card key={p.id} borderWidth={1} borderColor="$borderColor" p="$3" bg="white">
          <YStack gap="$2">
            <SizableText size="$5" fontWeight="bold">
              {p.nombre}
            </SizableText>
            <XStack jc="space-between" ai="center">
              <SizableText color="$colorHover">
                Bs.
                {p.precio_venta.toFixed(2)}
              </SizableText>
              <SizableText color="$colorHover">
                Stock:
                {p.stock_actual}
              </SizableText>
            </XStack>
            <Button
              mt="$2"
              bg="$color"
              color="white"
              onPress={() => handleAddToCart(p)}
              disabled={p.stock_actual <= 0}
            >
              {p.stock_actual > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
            </Button>
          </YStack>
        </Card>
      ));
    }
    return <SizableText color="$colorHover">No se encontraron productos.</SizableText>;
  };

  return (
    <YStack f={1} bg="$background">
      <Button
        bg="$colorHover"
        color="white"
        borderRadius={0}
        icon={<MapPin color="white" size={16} />}
        onPress={() => router.push('/map')}
        py="$3"
      >
        <SizableText color="white" size="$3" fontWeight="bold">
          {currentSucursal ? `Farmacia: ${currentSucursal.nombre}` : 'Seleccione una farmacia...'}
        </SizableText>
      </Button>

      <YStack f={1} p="$4">
        <XStack gap="$2" ai="center" mb="$4">
          <Button
            icon={CameraIcon}
            bg="$color"
            color="white"
            onPress={() => router.push('/scanner')}
            circular
          />
          <Button
            icon={isListening ? MicOff : Mic}
            bg={isListening ? 'red' : '$color'}
            color="white"
            onPress={handleVoiceSearch}
            circular
          />
          <Input
            f={1}
            placeholder="Buscar..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setActiveSearchQuery(searchInput)}
            bg="white"
          />
          <Button
            icon={Search}
            bg="$color"
            color="white"
            circular
            onPress={() => setActiveSearchQuery(searchInput)}
          />
        </XStack>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
          }
        >
          <YStack gap="$3">
            <SizableText size="$6" fontWeight="bold" color="$color">
              Productos Destacados
            </SizableText>

            {renderContent()}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  );
}
