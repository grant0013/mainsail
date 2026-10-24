<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row title="Style preset" sub-title="Sets every option below in one go; you can then tweak any of them.">
                    <v-select v-model="preset" :items="presetItems" class="mt-0" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Accent colour" sub-title="Buttons, progress and highlights.">
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template #activator="{ on, attrs }">
                            <v-btn v-bind="attrs" :color="accent" class="minwidth-0 px-5" small v-on="on" />
                        </template>
                        <v-color-picker :value="accent" hide-mode-switch mode="hexa" @update:color="updateAccent" />
                    </v-menu>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Card style">
                    <v-select v-model="cardStyle" :items="cardStyles" class="mt-0" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Corner radius" :sub-title="radius + ' px'">
                    <v-slider v-model="radius" :min="0" :max="24" :step="1" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Density">
                    <v-select v-model="density" :items="densities" class="mt-0" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Text size" :sub-title="fontScale + '%'">
                    <v-slider v-model="fontScale" :min="85" :max="125" :step="5" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    title="Control centre"
                    sub-title="Print status, progress, quick actions and temperatures across the top of the dashboard.">
                    <v-switch v-model="controlCentre" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row title="Reset appearance">
                    <v-btn small outlined @click="applyPreset('default')">Back to Mainsail default</v-btn>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { harkAppearanceDefaults, harkPresets } from '@/plugins/harkAppearance'

@Component({
    components: { SettingsRow },
})
export default class SettingsAppearanceTab extends Mixins(BaseMixin) {
    cardStyles = [
        { text: 'Flat', value: 'flat' },
        { text: 'Outlined', value: 'outlined' },
        { text: 'Elevated', value: 'elevated' },
        { text: 'Glass', value: 'glass' },
    ]

    densities = [
        { text: 'Comfortable', value: 'comfortable' },
        { text: 'Compact', value: 'compact' },
    ]

    get presetItems() {
        return Object.entries(harkPresets).map(([value, p]) => ({ text: p.label, value }))
    }

    getValue(key: string) {
        const stored = this.$store.state.gui.hark?.appearance ?? {}
        return key in stored ? stored[key] : (harkAppearanceDefaults as any)[key]
    }

    save(key: string, value: unknown) {
        this.$store.dispatch('gui/saveSetting', { name: `hark.appearance.${key}`, value })
    }

    applyPreset(name: string) {
        const p = harkPresets[name]
        if (!p) return

        this.save('preset', name)
        this.save('cardStyle', p.cardStyle)
        this.save('radius', p.radius)
        this.save('density', p.density)
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.primary', value: p.accent })
    }

    get preset() {
        return this.getValue('preset')
    }

    set preset(value: string) {
        this.applyPreset(value)
    }

    get accent() {
        return this.$store.state.gui.uiSettings.primary
    }

    updateAccent(colour: { hex: string }) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.primary', value: colour.hex.slice(0, 7) })
    }

    get cardStyle() {
        return this.getValue('cardStyle')
    }

    set cardStyle(value: string) {
        this.save('cardStyle', value)
    }

    get radius() {
        return this.getValue('radius')
    }

    set radius(value: number) {
        this.save('radius', value)
    }

    get density() {
        return this.getValue('density')
    }

    set density(value: string) {
        this.save('density', value)
    }

    get fontScale() {
        return this.getValue('fontScale')
    }

    set fontScale(value: number) {
        this.save('fontScale', value)
    }

    get controlCentre() {
        return this.$store.state.gui.hark?.controlCentre ?? true
    }

    set controlCentre(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'hark.controlCentre', value })
    }
}
</script>
