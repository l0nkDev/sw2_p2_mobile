import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, ScrollView, Card, SizableText, Spinner, XStack, YStack,
} from 'tamagui';
import { RootState } from '../store';
import { useGetSucursalesQuery } from '../store/api';
import { setSucursal } from '../store/cartSlice';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line global-require
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const { focusSucursalId } = useLocalSearchParams();

  const { data: sucursalesData, isLoading: isLoadingSucursales } = useGetSucursalesQuery({});
  const currentSucursalId = useSelector((state: RootState) => state.cart.sucursalId);
  const dispatch = useDispatch();
  const router = useRouter();

  const focusId = focusSucursalId ? Number(focusSucursalId) : currentSucursalId;
  const focusedSucursal = sucursalesData?.sucursales?.find((s: any) => s.id === focusId);

  useEffect(() => {
    (async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, []);

  const handleSelectSucursal = (id: number) => {
    dispatch(setSucursal(id));
    router.back();
  };

  const centerLat = focusedSucursal?.latitud || location?.coords.latitude || 0;
  const centerLon = focusedSucursal?.longitud || location?.coords.longitude || 0;

  if (isLoadingSucursales || (!focusedSucursal && !location)) {
    return (
      <YStack f={1} jc="center" ai="center" bg="$background">
        <Spinner size="large" color="$color" />
        <SizableText mt="$2" color="$colorHover">
          Cargando mapa...
        </SizableText>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="rgba(0,0,0,0.5)" jc="center" ai="center" p="$4">
      {/* Background Dimmer */}
      <TouchableOpacity
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        }}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <Card
        w="100%"
        maxHeight="85%"
        bg="$background"
        borderRadius="$4"
        overflow="hidden"
        elevation="$4"
      >
        <XStack p="$3" jc="space-between" ai="center" bg="$color">
          <SizableText size="$5" fontWeight="bold" color="white">
            Seleccionar Farmacia
          </SizableText>
          <Button
            size="$3"
            circular
            icon={<X color="white" />}
            bg="transparent"
            onPress={() => router.back()}
          />
        </XStack>

        <YStack h={300} bg="$gray2">
          {Platform.OS === 'web' ? (
            <YStack f={1} jc="center" ai="center">
              <SizableText color="$color">El mapa no está disponible en Web.</SizableText>
            </YStack>
          ) : (
            <MapView
              style={{ flex: 1 }}
              showsUserLocation
              region={{
                latitude: centerLat,
                longitude: centerLon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {sucursalesData?.sucursales?.map((suc: any) => {
                if (!suc.latitud || !suc.longitud) return null;
                const isClosest = suc.id === currentSucursalId;
                return (
                  <Marker
                    key={suc.id}
                    coordinate={{
                      latitude: suc.latitud,
                      longitude: suc.longitud,
                    }}
                    title={suc.nombre}
                    description={suc.direccion}
                    pinColor={isClosest ? 'green' : 'red'}
                    onPress={() => handleSelectSucursal(suc.id)}
                  />
                );
              })}
            </MapView>
          )}
        </YStack>

        <ScrollView style={{ flex: 1 }}>
          <YStack p="$3" gap="$2">
            {sucursalesData?.sucursales?.map((suc: any) => {
              const isSelected = suc.id === currentSucursalId;
              return (
                <Button
                  key={suc.id}
                  size="$5"
                  bg={isSelected ? '$colorHover' : 'white'}
                  color={isSelected ? 'white' : '$color'}
                  jc="flex-start"
                  icon={isSelected ? <Check color="white" /> : <MapPin color="gray" />}
                  onPress={() => handleSelectSucursal(suc.id)}
                  borderWidth={1}
                  borderColor="$borderColor"
                  mb="$2"
                >
                  <YStack>
                    <SizableText
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      color={isSelected ? 'white' : '$color'}
                    >
                      {suc.nombre}
                    </SizableText>
                    <SizableText size="$2" color={isSelected ? 'white' : '$colorHover'}>
                      {suc.direccion}
                    </SizableText>
                  </YStack>
                </Button>
              );
            })}
          </YStack>
        </ScrollView>
      </Card>
    </YStack>
  );
}
