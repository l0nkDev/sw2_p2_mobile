import React, { useState } from 'react'
import { YStack, ScrollView, SizableText, Input, XStack, Button, Spinner, Card } from 'tamagui'
import { Search } from 'lucide-react-native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { useGetProductosQuery, useGetSucursalesQuery } from '../../store/api'
import { addItem, setSucursal } from '../../store/cartSlice'

export default function StorefrontScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const dispatch = useDispatch()
  const sucursalId = useSelector((state: RootState) => state.cart.sucursalId)

  // Fetch branches as a fallback if no branch is selected yet
  const { data: sucursalesData } = useGetSucursalesQuery({}, { skip: !!sucursalId })

  React.useEffect(() => {
    if (!sucursalId && sucursalesData?.sucursales?.length > 0) {
      dispatch(setSucursal(sucursalesData.sucursales[0].id))
    }
  }, [sucursalId, sucursalesData, dispatch])
  
  const { data, isLoading } = useGetProductosQuery(
    { sucursalId: sucursalId! },
    { skip: !sucursalId }
  )

  const handleAddToCart = (producto: any) => {
    dispatch(
      addItem({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_venta,
      })
    )
  }

  const productos = data?.productos || []
  const filteredProducts = productos.filter((p: any) => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <YStack f={1} bg="$background" p="$4">
      <XStack gap="$2" ai="center" mb="$4">
        <Input
          f={1}
          placeholder="Search for medication..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          bg="white"
        />
        <Button icon={Search} bg="$color" color="white" hoverStyle={{ bg: '$colorHover' }}>
          Search
        </Button>
      </XStack>

      <ScrollView>
        <YStack gap="$3">
          <SizableText size="$6" fontWeight="bold" color="$color">
            Featured Products
          </SizableText>
          
          {!sucursalId ? (
            <YStack p="$4" ai="center">
              <Spinner size="large" color="$color" />
              <SizableText mt="$2" color="$colorHover">Loading default pharmacy...</SizableText>
            </YStack>
          ) : isLoading ? (
            <YStack p="$4" ai="center">
              <Spinner size="large" color="$color" />
            </YStack>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p: any) => (
              <Card key={p.id} borderWidth={1} borderColor="$borderColor" p="$3" bg="white">
                <YStack gap="$2">
                  <SizableText size="$5" fontWeight="bold">{p.nombre}</SizableText>
                  <XStack jc="space-between" ai="center">
                    <SizableText color="$colorHover">${p.precio_venta.toFixed(2)}</SizableText>
                    <SizableText color="$colorHover">Stock: {p.stock_actual}</SizableText>
                  </XStack>
                  <Button 
                    mt="$2" 
                    bg="$color" 
                    color="white" 
                    onPress={() => handleAddToCart(p)}
                    disabled={p.stock_actual <= 0}
                  >
                    {p.stock_actual > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </YStack>
              </Card>
            ))
          ) : (
            <SizableText color="$colorHover">No products found.</SizableText>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
