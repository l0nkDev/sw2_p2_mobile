import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const pastelLightBlue = {
  background: '#E6F0FA',
  backgroundHover: '#D4E6F6',
  backgroundPress: '#C2DCF2',
  backgroundFocus: '#B0D2EE',
  borderColor: '#A0C8EA',
  borderColorHover: '#8EBEE6',
  color: '#2A4A6D',
  colorHover: '#1D3B5C',
  colorPress: '#112B4A',
  colorFocus: '#061C38',
}

export const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light_pastelBlue: {
      ...config.themes.light,
      ...pastelLightBlue,
    },
    dark_pastelBlue: {
      ...config.themes.dark,
      ...pastelLightBlue,
    }
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
