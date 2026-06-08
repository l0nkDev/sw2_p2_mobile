import React from 'react'
import { YStack, ScrollView, SizableText, XStack, Button, Card, Separator } from 'tamagui'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { removeItem, clearCart } from '../store/cartSlice'
import { useCreateVentaMutation } from '../store/api'
import { Alert } from 'react-native'
import { router } from 'expo-router'

export default function CartScreen() {
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const sucursalId = useSelector((state: RootState) => state.cart.sucursalId)
  const dispatch = useDispatch()
  const [createVenta, { isLoading }] = useCreateVentaMutation()

  const total = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const handleCheckout = async () => {
    if (!sucursalId || cartItems.length === 0) return

    try {
      const detalles = cartItems.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }))
      
      await createVenta({ sucursalId, detalles }).unwrap()
      
      Alert.alert('Success', 'Order created successfully!')
      dispatch(clearCart())
      router.back()
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Failed to create order')
    }
  }

  return (
    <YStack f={1} bg="$background" p="$4">
      <SizableText size="$8" fontWeight="bold" color="$color" mb="$4">
        Your Cart
      </SizableText>
      
      <ScrollView f={1}>
        {cartItems.length === 0 ? (
          <SizableText color="$colorHover">Your cart is empty.</SizableText>
        ) : (
          <YStack gap="$3">
            {cartItems.map((item) => (
              <Card key={item.productoId} borderWidth={1} borderColor="$borderColor" p="$3" bg="white">
                <XStack jc="space-between" ai="center">
                  <YStack f={1}>
                    <SizableText fontWeight="bold" numberOfLines={1}>{item.nombre}</SizableText>
                    <SizableText color="$colorHover">
                      {item.cantidad} x ${item.precio.toFixed(2)}
                    </SizableText>
                  </YStack>
                  <Button size="$3" theme="red_active" onPress={() => dispatch(removeItem(item.productoId))}>
                    Remove
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
            <SizableText size="$6" fontWeight="bold">Total:</SizableText>
            <SizableText size="$6" fontWeight="bold" color="$color">
              ${total.toFixed(2)}
            </SizableText>
          </XStack>
          <Button 
            bg="$color" 
            color="white" 
            onPress={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Checkout'}
          </Button>
        </YStack>
      )}
    </YStack>
  )
}
