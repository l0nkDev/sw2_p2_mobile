import React, { useState } from 'react'
import { YStack, XStack, Input, Button, Text, SizableText, Image } from 'tamagui'
import { router } from 'expo-router'
import { useLoginMutation } from '../store/api'
import { setToken } from '../store/authSlice'
import { useDispatch } from 'react-redux'
import { Alert } from 'react-native'

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@multifarmacia.local')
  const [password, setPassword] = useState('Admin12345')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()

  const handleLogin = async () => {
    try {
      const response = await login({ correo_electronico: email, contrasena: password }).unwrap()
      if (response.login?.access_token) {
        dispatch(setToken(response.login.access_token))
        router.replace('/(tabs)/store')
      } else {
        Alert.alert('Error', 'Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Network or server error during login')
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$background">
      <SizableText size="$9" fontWeight="bold" color="$color">
        Pharmacy App
      </SizableText>
      <SizableText size="$4" color="$colorHover" mb="$4">
        Log in to continue
      </SizableText>

      <YStack w="100%" maxWidth={400} gap="$3">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
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
        >
          {isLoading ? 'Logging in...' : 'Sign In'}
        </Button>
      </YStack>
    </YStack>
  )
}
