import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router, Tabs } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  Clock, LogOut, ShoppingBag, ShoppingCart,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, useTheme } from 'tamagui';
import { RootState } from '../../store';
import { useGetSucursalesQuery } from '../../store/api';
import { setToken } from '../../store/authSlice';
import { setSucursal } from '../../store/cartSlice';

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2
    + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function HeaderLeftButton() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      await Notifications.unregisterForNotificationsAsync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to unregister push token on logout', e);
    }
    await SecureStore.deleteItemAsync('token');
    dispatch(setToken(null as any));
    router.replace('/');
  };

  return (
    <Button
      ml="$4"
      size="$3"
      chromeless
      icon={LogOut}
      onPress={handleLogout}
      color="#ef4444"
    />
  );
}

function HeaderRightCart() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const count = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Button mr="$4" size="$3" icon={ShoppingCart} onPress={() => router.push('/cart')}>
      {count > 0 ? count.toString() : undefined}
    </Button>
  );
}

function StoreTabBarIcon({ color }: { color: string }) {
  return <ShoppingBag color={color} />;
}
function HistoryTabBarIcon({ color }: { color: string }) {
  return <Clock color={color} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  const currentSucursalId = useSelector((state: RootState) => state.cart.sucursalId);
  const dispatch = useDispatch();
  const { data: sucursalesData } = useGetSucursalesQuery({});

  useEffect(() => {
    (async () => {
      // If the user already has a selected pharmacy, don't overwrite it with GPS
      if (currentSucursalId) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (sucursalesData?.sucursales?.length > 0) {
          let closest: any = null;
          let minDistance = Infinity;

          sucursalesData.sucursales.forEach((suc: any) => {
            if (suc.latitud && suc.longitud) {
              const dist = getDistance(
                loc.coords.latitude,
                loc.coords.longitude,
                suc.latitud,
                suc.longitud,
              );
              if (dist < minDistance) {
                minDistance = dist;
                closest = suc;
              }
            }
          });

          if (closest && closest.id !== currentSucursalId) {
            dispatch(setSucursal(closest.id));
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [sucursalesData, currentSucursalId, dispatch]);

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
        headerLeft: HeaderLeftButton,
      }}
    >
      <Tabs.Screen
        name="store"
        options={{
          title: 'Tienda',
          tabBarIcon: StoreTabBarIcon,
          headerRight: HeaderRightCart,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Pedidos',
          tabBarIcon: HistoryTabBarIcon,
        }}
      />
    </Tabs>
  );
}
