import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Card, ScrollView, SizableText, XStack, YStack,
} from 'tamagui';
import { RootState } from '../store';
import { useCreateVentaMutation } from '../store/api';
import { clearCart, removeItem } from '../store/cartSlice';

export default function CartScreen() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const sucursalId = useSelector((state: RootState) => state.cart.sucursalId);
  const dispatch = useDispatch();
  const [createVenta, { isLoading }] = useCreateVentaMutation();

  const total = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleCheckout = async () => {
    if (!sucursalId || cartItems.length === 0) return;

    try {
      const detalles = cartItems.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      await createVenta({ sucursalId, detalles }).unwrap();

      Alert.alert('Success', 'Orden creada exitosamente!');
      dispatch(clearCart());
      router.back();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      Alert.alert('Error', 'Fallo al crear la orden');
    }
  };

  return (
    <YStack f={1} bg="$background" p="$4">
      <SizableText size="$8" fontWeight="bold" color="$color" mb="$4">
        Tu Carrito
      </SizableText>

      <ScrollView f={1}>
        {cartItems.length === 0 ? (
          <SizableText color="$colorHover">Tu carrito esta vacio.</SizableText>
        ) : (
          <YStack gap="$3">
            {cartItems.map((item) => (
              <Card
                key={item.productoId}
                borderWidth={1}
                borderColor="$borderColor"
                p="$3"
                bg="white"
              >
                <XStack jc="space-between" ai="center">
                  <YStack f={1}>
                    <SizableText fontWeight="bold" numberOfLines={1}>
                      {item.nombre}
                    </SizableText>
                    <SizableText color="$colorHover">
                      {item.cantidad}
                      {' '}
                      x Bs.
                      {item.precio.toFixed(2)}
                    </SizableText>
                  </YStack>
                  <Button
                    size="$3"
                    theme="red_active"
                    onPress={() => dispatch(removeItem(item.productoId))}
                  >
                    Quitar
                  </Button>
                </XStack>
              </Card>
            ))}
          </YStack>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <YStack pt="$4" borderTopWidth={1} borderColor="$borderColor">
          <XStack jc="space-between" mb="$4">
            <SizableText size="$6" fontWeight="bold">
              Total:
            </SizableText>
            <SizableText size="$6" fontWeight="bold" color="$color">
              Bs.
              {total.toFixed(2)}
            </SizableText>
          </XStack>
          <Button bg="$color" color="white" onPress={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Finalizar pedido'}
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
