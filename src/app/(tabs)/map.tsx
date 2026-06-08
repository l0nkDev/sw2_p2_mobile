import React, { useState, useEffect, useMemo } from 'react'
import { YStack, SizableText, Spinner } from 'tamagui'
import { Platform } from 'react-native'
import * as Location from 'expo-location'
import { useGetSucursalesQuery } from '../../store/api'
import { useDispatch, useSelector } from 'react-redux'
import { setSucursal } from '../../store/cartSlice'
import { RootState } from '../../store'

let MapView: any = null
let Marker: any = null
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps')
  MapView = Maps.default
  Marker = Maps.Marker
}

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295 // Math.PI / 180
  const c = Math.cos
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2
  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { data: sucursalesData, isLoading: isLoadingSucursales } = useGetSucursalesQuery({})
  const dispatch = useDispatch()
  const currentSucursalId = useSelector((state: RootState) => state.cart.sucursalId)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc)
    })()
  }, [])

  // Find closest pharmacy
  useEffect(() => {
    if (location && sucursalesData?.sucursales?.length > 0) {
      let closest: any = null
      let minDistance = Infinity

      for (const suc of sucursalesData.sucursales) {
        if (suc.latitud && suc.longitud) {
          const dist = getDistance(
            location.coords.latitude,
            location.coords.longitude,
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
  }, [location, sucursalesData, currentSucursalId, dispatch])

  return (
    <YStack f={1} bg="$background">
      {errorMsg ? (
        <YStack f={1} jc="center" ai="center" p="$4">
          <SizableText color="red">{errorMsg}</SizableText>
        </YStack>
      ) : location && !isLoadingSucursales ? (
        Platform.OS === 'web' ? (
          <YStack f={1} jc="center" ai="center">
            <SizableText color="$color">Map is not supported on Web.</SizableText>
            {sucursalesData?.sucursales?.map((suc: any) => (
              <SizableText key={suc.id} color={suc.id === currentSucursalId ? 'green' : '$colorHover'}>
                {suc.nombre} {suc.id === currentSucursalId && '(Closest)'}
              </SizableText>
            ))}
          </YStack>
        ) : (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              pinColor="blue"
            />
            
            {sucursalesData?.sucursales?.map((suc: any) => {
              if (!suc.latitud || !suc.longitud) return null
              const isClosest = suc.id === currentSucursalId
              return (
                <Marker
                  key={suc.id}
                  coordinate={{
                    latitude: suc.latitud,
                    longitude: suc.longitud,
                  }}
                  title={suc.nombre}
                  description={suc.direccion}
                  pinColor={isClosest ? 'green' : 'red'}
                />
              )
            })}
          </MapView>
        )
      ) : (
        <YStack f={1} jc="center" ai="center">
          <Spinner size="large" color="$color" />
          <SizableText mt="$2" color="$colorHover">Finding closest pharmacy...</SizableText>
        </YStack>
      )}
    </YStack>
  )
}
