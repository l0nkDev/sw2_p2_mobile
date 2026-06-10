import React, { useState, useEffect } from 'react'
import { YStack, XStack, Input, Button, Text, SizableText, Image, Spinner } from 'tamagui'
import { router } from 'expo-router'
import { useLoginMutation } from '../store/api'
import { setToken } from '../store/authSlice'
import { useDispatch } from 'react-redux'
import { Alert, Image as RNImage } from 'react-native'
import * as SecureStore from 'expo-secure-store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token')
        if (storedToken) {
          dispatch(setToken(storedToken))
          router.replace('/(tabs)/store')
        }
      } catch (e) {
        console.error('Error reading token', e)
      } finally {
        setIsCheckingToken(false)
      }
    }
    checkToken()
  }, [dispatch])

  const handleLogin = async () => {
    try {
      const response = await login({ correo_electronico: email, contrasena: password }).unwrap()
      if (response.login?.access_token) {
        const token = response.login.access_token
        await SecureStore.setItemAsync('token', token)
        dispatch(setToken(token))
        router.replace('/(tabs)/store')
      } else {
        Alert.alert('Error', 'Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Network or server error during login')
    }
  }

  if (isCheckingToken) {
    return (
      <YStack f={1} jc="center" ai="center" bg="$background">
        <SizableText>Cargando...</SizableText>
      </YStack>
    )
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$background">
      <RNImage 
        source={require('../../assets/images/title.png')} 
        style={{ width: 300, height: 100, resizeMode: 'contain' }} 
      />
      <SizableText size="$4" color="$colorHover" mb="$4">
        Inicia sesión para continuar
      </SizableText>

      <YStack w="100%" maxWidth={400} gap="$3">
        <Input
          placeholder="Correo electrónico"
          placeholderTextColor="$colorHover"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Contraseña"
          placeholderTextColor="$colorHover"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          onPress={handleLogin}
          disabled={isLoading}
          mt="$4"
          bg="$color"
          color="white"
          hoverStyle={{ bg: '$colorHover' }}
          pressStyle={{ bg: '$colorPress' }}
          icon={isLoading ? () => <Spinner color="white" /> : undefined}
        >
          {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>
        <Button
          mt="$2"
          chromeless
          onPress={() => router.push('/register')}
        >
          ¿No tienes una cuenta? ¡Crea una!
        </Button>
      </YStack>
    </YStack>
  )
}
