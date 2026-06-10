import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { Provider } from 'react-redux'
import tamaguiConfig from '../../tamagui.config'
import { store } from '../store'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { registerForPushNotificationsAsync } from '../utils/notifications'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
      
      // Request push notification permissions and fetch token
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          // You could dispatch this to Redux if needed
          console.log('Push notification setup complete.');
        }
      });
    }
  }, [loaded])

  if (!loaded) return null

  return (
    <Provider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light_pastelBlue">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="scanner" options={{ headerShown: false }} />
          <Stack.Screen name="map" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Carrito' }} />
        </Stack>
      </TamaguiProvider>
    </Provider>
  )
}
