import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronUp, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, ScrollView, Sheet, SizableText, Spinner, XStack, YStack,
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
  const [sheetOpen, setSheetOpen] = useState(false);

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
    setSheetOpen(false);
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
    <YStack f={1} bg="$background">
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

      {/* Floating Button to open the Sheet */}
      <Button
        pos="absolute"
        bottom="$6"
        alignSelf="center"
        size="$4"
        bg="$color"
        color="white"
        icon={ChevronUp}
        onPress={() => setSheetOpen(true)}
        elevation="$4"
        circular
      />

      {/* Retractable Bottom Sheet */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[50, 85]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame p="$4" bg="$background">
          <XStack jc="center" mb="$4">
            <SizableText size="$6" fontWeight="bold" color="$color">
              Seleccionar Farmacia
            </SizableText>
          </XStack>

          <ScrollView>
            <YStack gap="$2">
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
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
