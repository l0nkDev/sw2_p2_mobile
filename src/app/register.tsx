import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useState } from 'react'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import { Button, Input, ScrollView, SizableText, Spinner, YStack } from 'tamagui'
import { useRegisterMutation } from '../store/api'
import { setToken } from '../store/authSlice'

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nombre_usuario: '',
    correo_electronico: '',
    contrasena: '',
    celular: '',
  })

  const [register, { isLoading }] = useRegisterMutation()
  const dispatch = useDispatch()

  const handleRegister = async () => {
    if (
      !form.nombre ||
      !form.apellido ||
      !form.correo_electronico ||
      !form.contrasena ||
      !form.nombre_usuario
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      const response = await register(form).unwrap()
      if (response.register?.access_token) {
        const token = response.register.access_token
        await SecureStore.setItemAsync('token', token)
        dispatch(setToken(token))
        router.replace('/(tabs)/store')
      } else {
        Alert.alert('Error', 'Registration failed')
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert('Error', err.data?.message || 'Network or server error during registration')
    }
  }

  return (
    <ScrollView bg="$background">
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4" mt="$8">
        <SizableText size="$9" fontWeight="bold" color="$color">
          Create Account
        </SizableText>
        <SizableText size="$4" color="$colorHover" mb="$4">
          Join Pharmacy App
        </SizableText>

        <YStack w="100%" maxWidth={400} gap="$3">
          <Input
            placeholder="First Name *"
            placeholderTextColor="$colorHover"
            value={form.nombre}
            onChangeText={(text) => setForm({ ...form, nombre: text })}
          />
          <Input
            placeholder="Last Name *"
            placeholderTextColor="$colorHover"
            value={form.apellido}
            onChangeText={(text) => setForm({ ...form, apellido: text })}
          />
          <Input
            placeholder="Username *"
            placeholderTextColor="$colorHover"
            value={form.nombre_usuario}
            onChangeText={(text) => setForm({ ...form, nombre_usuario: text })}
            autoCapitalize="none"
          />
          <Input
            placeholder="Email *"
            placeholderTextColor="$colorHover"
            value={form.correo_electronico}
            onChangeText={(text) => setForm({ ...form, correo_electronico: text })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Phone Number (Optional)"
            placeholderTextColor="$colorHover"
            value={form.celular}
            onChangeText={(text) => setForm({ ...form, celular: text })}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="Password *"
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
            icon={isLoading ? () => <Spinner color="white" /> : undefined}
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </Button>

          <Button mt="$2" chromeless onPress={() => router.back()}>
            Already have an account? Log in
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
