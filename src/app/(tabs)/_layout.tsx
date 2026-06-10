import React, { useEffect } from 'react'
import { Tabs } from 'expo-router'
import { ShoppingBag, Clock, ShoppingCart, LogOut } from 'lucide-react-native'
import { useTheme, Button } from 'tamagui'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { useGetSucursalesQuery } from '../../store/api'
import { setSucursal } from '../../store/cartSlice'
import { setToken } from '../../store/authSlice'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295
  const c = Math.cos
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2
  return 12742 * Math.asin(Math.sqrt(a))
}

export default function TabsLayout() {
  const theme = useTheme()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const currentSucursalId = useSelector((state: RootState) => state.cart.sucursalId)
  const count = cartItems.reduce((acc, item) => acc + item.cantidad, 0)

  const dispatch = useDispatch()
  const { data: sucursalesData } = useGetSucursalesQuery({})

  const handleLogout = async () => {
    try {
      await Notifications.unregisterForNotificationsAsync()
    } catch (e) {
      console.error('Failed to unregister push token on logout', e)
    }
    await SecureStore.deleteItemAsync('token')
    dispatch(setToken(null as any))
    router.replace('/')
  }

  useEffect(() => {
    (async () => {
      // If the user already has a selected pharmacy, don't overwrite it with GPS
      if (currentSucursalId) return

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      try {
        const loc = await Location.getCurrentPositionAsync({})
        if (sucursalesData?.sucursales?.length > 0) {
          let closest: any = null
          let minDistance = Infinity

          for (const suc of sucursalesData.sucursales) {
            if (suc.latitud && suc.longitud) {
              const dist = getDistance(
                loc.coords.latitude,
                loc.coords.longitude,
                suc.latitud,
                suc.longitud
              )
              if (dist < minDistance) {
                minDistance = dist
                closest = suc
              }
            }
          }

          if (closest && closest.id !== currentSucursalId) {
            dispatch(setSucursal(closest.id))
          }
        }
      } catch (e) {
        // Ignored
      }
    })()
  }, [sucursalesData, currentSucursalId, dispatch])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.color.get(),
        tabBarInactiveTintColor: theme.colorHover.get(),
        tabBarStyle: {
          backgroundColor: theme.background.get(),
          borderTopColor: theme.borderColor.get(),
        },
        headerStyle: {
          backgroundColor: theme.background.get(),
        },
        headerTintColor: theme.color.get(),
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <Button
            ml="$4"
            size="$3"
            chromeless
            icon={LogOut}
            onPress={handleLogout}
            color="#ef4444"
          />
        ),
      }}
    >
      <Tabs.Screen
        name="store"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color }) => <ShoppingBag color={color as string} />,
          headerRight: () => (
            <Button 
              mr="$4" 
              size="$3" 
              icon={ShoppingCart} 
              onPress={() => router.push('/cart')}
            >
              {count > 0 ? count.toString() : undefined}
            </Button>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <Clock color={color as string} />,
        }}
      />
    </Tabs>
  )
}
