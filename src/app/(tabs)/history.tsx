import React from 'react'
import { YStack, ScrollView, SizableText } from 'tamagui'

export default function HistoryScreen() {
  return (
    <YStack f={1} bg="$background" p="$4">
      <ScrollView>
        <YStack gap="$3">
          <SizableText size="$6" fontWeight="bold" color="$color">
            Your Orders
          </SizableText>
          <SizableText color="$colorHover">No past orders found.</SizableText>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
