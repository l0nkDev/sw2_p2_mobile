import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import {
  Button, Input, ScrollView, SizableText, Spinner, YStack,
} from 'tamagui';
import { useRegisterMutation } from '../store/api';
import { setToken } from '../store/authSlice';

function LoadingSpinner() {
  return <Spinner color="white" />;
}

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nombre_usuario: '',
    correo_electronico: '',
    contrasena: '',
    celular: '',
  });

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (
      !form.nombre
      || !form.apellido
      || !form.correo_electronico
      || !form.contrasena
      || !form.nombre_usuario
    ) {
      Alert.alert('Error', 'Por favor rellena todos los campos');
      return;
    }

    try {
      let pushToken;

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            pushToken = tokenData.data;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        }
      }

      const response = await register({ ...form, notification_token: pushToken }).unwrap();
      if (response.registerCliente?.access_token || response.register?.access_token) {
        const token = response.registerCliente?.access_token || response.register?.access_token;
        await SecureStore.setItemAsync('token', token);
        dispatch(setToken(token));
        router.replace('/(tabs)/store');
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      Alert.alert('Error', err.data?.message || 'Network or server error during registration');
    }
  };

  return (
    <ScrollView bg="$background">
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4" mt="$8">
        <SizableText size="$9" fontWeight="bold" color="$color">
          Regístrate
        </SizableText>
        <SizableText size="$4" color="$colorHover" mb="$4">
          Únete a PharmaFICCT
        </SizableText>

        <YStack w="100%" maxWidth={400} gap="$3">
          <Input
            placeholder="Nombre *"
            placeholderTextColor="$colorHover"
            value={form.nombre}
            onChangeText={(text) => setForm({ ...form, nombre: text })}
          />
          <Input
            placeholder="Apellido *"
            placeholderTextColor="$colorHover"
            value={form.apellido}
            onChangeText={(text) => setForm({ ...form, apellido: text })}
          />
          <Input
            placeholder="Nombre de usuario *"
            placeholderTextColor="$colorHover"
            value={form.nombre_usuario}
            onChangeText={(text) => setForm({ ...form, nombre_usuario: text })}
            autoCapitalize="none"
          />
          <Input
            placeholder="Correo electrónico *"
            placeholderTextColor="$colorHover"
            value={form.correo_electronico}
            onChangeText={(text) => setForm({ ...form, correo_electronico: text })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Número de celular (Opcional)"
            placeholderTextColor="$colorHover"
            value={form.celular}
            onChangeText={(text) => setForm({ ...form, celular: text })}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="Contraseña *"
            placeholderTextColor="$colorHover"
            value={form.contrasena}
            onChangeText={(text) => setForm({ ...form, contrasena: text })}
            secureTextEntry
          />

          <Button
            onPress={handleRegister}
            disabled={isLoading}
            mt="$4"
            bg="$color"
            color="white"
            hoverStyle={{ bg: '$colorHover' }}
            pressStyle={{ bg: '$colorPress' }}
            icon={isLoading ? LoadingSpinner : undefined}
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>

          <Button mt="$2" chromeless onPress={() => router.back()}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
