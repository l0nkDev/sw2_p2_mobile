import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const mintGreen = {
  background: '#F0FDF4',
  backgroundHover: '#DCFCE7',
  backgroundPress: '#BBF7D0',
  backgroundFocus: '#86EFAC',
  borderColor: '#4ADE80',
  borderColorHover: '#22C55E',
  color: '#10B981',
  colorHover: '#059669',
  colorPress: '#047857',
  colorFocus: '#064E3B',
}

export const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light_pastelBlue: {
      ...config.themes.light,
      ...mintGreen,
    },
    dark_pastelBlue: {
      ...config.themes.dark,
      ...mintGreen,
    }
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
