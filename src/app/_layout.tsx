import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { Provider } from 'react-redux'
import tamaguiConfig from '../../tamagui.config'
import { store } from '../store'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null

  return (
    <Provider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light_pastelBlue">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Cart' }} />
        </Stack>
      </TamaguiProvider>
    </Provider>
  )
}
