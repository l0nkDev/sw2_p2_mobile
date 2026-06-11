import { Stack } from 'expo-router';
import { PortalProvider, TamaguiProvider } from 'tamagui';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import interMedium from '@tamagui/font-inter/otf/Inter-Medium.otf';
import interBold from '@tamagui/font-inter/otf/Inter-Bold.otf';
import { store } from '../store';
import { tamaguiConfig } from '../../tamagui.config';
import { registerForPushNotificationsAsync } from '../utils/notifications';

// @ts-ignore
// @ts-ignore

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: interMedium,
    InterBold: interBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Request push notification permissions and fetch token
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          // You could dispatch this to Redux if needed
          // eslint-disable-next-line no-console
          console.log('Push notification setup complete.');
        }
      });
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light_pastelBlue">
        <PortalProvider shouldAddRootHost>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="scanner" options={{ presentation: 'transparentModal', headerShown: false }} />
            <Stack.Screen name="map" options={{ presentation: 'transparentModal', headerShown: false }} />
            <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Carrito' }} />
          </Stack>
        </PortalProvider>
      </TamaguiProvider>
    </Provider>
  );
}
