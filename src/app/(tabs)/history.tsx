import React from 'react';
import {
  YStack, ScrollView, SizableText, Spinner, Card, XStack, Separator, Button,
} from 'tamagui';
import { MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGetVentasQuery, useGetSucursalesQuery } from '../../store/api';

export default function HistoryScreen() {
  const { data, isLoading } = useGetVentasQuery({});
  const { data: sucursalesData } = useGetSucursalesQuery({});

  const ventas = data?.ventas || [];
  const sucursales = sucursalesData?.sucursales || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <YStack p="$4" ai="center">
          <Spinner size="large" color="$color" />
        </YStack>
      );
    }

    if (ventas.length > 0) {
      return ventas.map((venta: any) => {
        const sucursal = sucursales.find((s: any) => s.id === venta.sucursal_id);

        return (
          <Card key={venta.id} borderWidth={1} borderColor="$borderColor" p="$3" bg="white">
            <YStack gap="$2">
              <XStack jc="space-between" ai="center">
                <SizableText size="$5" fontWeight="bold">
                  Orden #
                  {venta.id}
                </SizableText>
                <SizableText color="$colorHover">
                  $
                  {venta.total.toFixed(2)}
                </SizableText>
              </XStack>

              <XStack jc="space-between" ai="center">
                <SizableText color="$colorHover" size="$3">
                  {new Date(venta.fecha_venta).toLocaleDateString('es-BO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </SizableText>

                <YStack
                  bg={venta.estado === 'PENDIENTE' ? '$yellow4' : '$green4'}
                  px="$2"
                  py="$1"
                  borderRadius="$4"
                >
                  <SizableText
                    size="$2"
                    fontWeight="bold"
                    color={venta.estado === 'PENDIENTE' ? '$yellow10' : '$green10'}
                  >
                    {venta.estado}
                  </SizableText>
                </YStack>
              </XStack>

              {sucursal && (
                <XStack jc="space-between" ai="center" mt="$1">
                  <SizableText size="$3" color="$color">
                    Farmacia:
                    {' '}
                    {sucursal.nombre}
                  </SizableText>
                  <Button
                    size="$2"
                    icon={MapPin}
                    bg="$color"
                    color="white"
                    onPress={() => router.push(`/map?focusSucursalId=${sucursal.id}`)}
                  >
                    Mapa
                  </Button>
                </XStack>
              )}

              <Separator my="$2" />
              {venta.detalles.map((detalle: any) => (
                <XStack key={detalle.id} jc="space-between">
                  <SizableText>
                    {detalle.cantidad}
                    x
                    {detalle.producto_nombre}
                  </SizableText>
                  <SizableText color="$colorHover">
                    Bs.
                    {' '}
                    {detalle.subtotal.toFixed(2)}
                  </SizableText>
                </XStack>
              ))}
            </YStack>
          </Card>
        );
      });
    }

    return (
      <SizableText color="$colorHover">No se encontraron pedidos anteriores.</SizableText>
    );
  };

  return (
    <YStack f={1} bg="$background" p="$4">
      <ScrollView>
        <YStack gap="$3">
          <SizableText size="$6" fontWeight="bold" color="$color" mb="$2">
            Tus Pedidos
          </SizableText>

          {renderContent()}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
