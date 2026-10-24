// Hark appearance presets for the K2 open-stack Mainsail build.
//
// A preset sets every appearance field at once (users can then tweak any of
// them). The accent is applied through Mainsail's own primary colour so all
// existing components follow it. "default" leaves Mainsail's stock look alone.

export type HarkCardStyle = 'flat' | 'outlined' | 'elevated' | 'glass'
export type HarkDensity = 'comfortable' | 'compact'

export interface HarkAppearance {
    preset: string
    cardStyle: HarkCardStyle
    radius: number
    density: HarkDensity
    fontScale: number
}

export interface HarkPreset extends Omit<HarkAppearance, 'preset' | 'fontScale'> {
    label: string
    accent: string
}

export const harkPresets: Record<string, HarkPreset> = {
    default: { label: 'Default (Mainsail)', accent: '#2196F3', cardStyle: 'flat', radius: 4, density: 'comfortable' },
    hark: { label: 'Hark Tech', accent: '#B8400A', cardStyle: 'outlined', radius: 14, density: 'comfortable' },
    glass: { label: 'Glass', accent: '#4FC3F7', cardStyle: 'glass', radius: 18, density: 'comfortable' },
    contrast: { label: 'High contrast', accent: '#FFD600', cardStyle: 'outlined', radius: 6, density: 'comfortable' },
}

export const harkAppearanceDefaults: HarkAppearance = {
    preset: 'default',
    cardStyle: 'flat',
    radius: 4,
    density: 'comfortable',
    fontScale: 100,
}
