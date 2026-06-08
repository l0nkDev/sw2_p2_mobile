import { Tabs } from 'expo-router'
import { Map, ShoppingBag, Clock, ShoppingCart } from 'lucide-react-native'
import { useTheme, Button } from 'tamagui'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { router } from 'expo-router'

export default function TabsLayout() {
  const theme = useTheme()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const count = cartItems.reduce((acc, item) => acc + item.cantidad, 0)

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
      }}
    >
      <Tabs.Screen
        name="store"
        options={{
          title: 'Storefront',
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
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Map color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Clock color={color as string} />,
        }}
      />
    </Tabs>
  )
}
