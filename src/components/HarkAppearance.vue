<template>
    <span class="d-none" />
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { harkAppearanceDefaults } from '@/plugins/harkAppearance'
import type { HarkAppearance } from '@/plugins/harkAppearance'

// Applies the Hark appearance settings to the document root as classes and
// CSS variables. Renders nothing.
@Component
export default class HarkAppearanceApplier extends Mixins(BaseMixin) {
    get appearance(): HarkAppearance {
        return { ...harkAppearanceDefaults, ...(this.$store.state.gui.hark?.appearance ?? {}) }
    }

    mounted() {
        this.apply()
    }

    @Watch('appearance', { deep: true })
    apply() {
        const root = document.documentElement
        const a = this.appearance

        Array.from(root.classList)
            .filter((name) => name.startsWith('hark-'))
            .forEach((name) => root.classList.remove(name))

        if (a.preset !== 'default') root.classList.add(`hark-preset-${a.preset}`)
        root.classList.add(`hark-cards-${a.cardStyle}`)
        root.classList.add(`hark-density-${a.density}`)
        root.style.setProperty('--hark-radius', `${a.radius}px`)
        root.style.fontSize = a.fontScale === 100 ? '' : `${(16 * a.fontScale) / 100}px`
    }
}
</script>

<style>
/* Shape and density apply to every preset, including Default. */
.v-application .panel {
    border-radius: var(--hark-radius, 4px) !important;
    overflow: hidden;
}

.v-application .panel .panel-toolbar {
    border-radius: 0 !important;
}

html.hark-cards-outlined .v-application .panel {
    box-shadow: none !important;
    border: 1px solid var(--hark-border, rgba(128, 128, 128, 0.35)) !important;
}

html.hark-cards-elevated .v-application .panel {
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35) !important;
}

html.hark-cards-glass .v-application .panel {
    background: var(--hark-glass, rgba(255, 255, 255, 0.06)) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.14) !important;
    box-shadow: none !important;
}

html.hark-cards-glass .v-application .panel .panel-toolbar {
    background: transparent !important;
}

html.hark-density-compact .v-application .panel .v-card__text {
    padding: 8px 12px !important;
}

html.hark-density-compact .v-application .panel .panel-toolbar {
    height: 40px !important;
}

/* Hark Tech: ink and paper palette with the burnt-orange accent. */
html.hark-preset-hark {
    --hark-border: #3b352d;
}

html.hark-preset-hark .v-application.theme--dark,
html.hark-preset-hark .v-application.theme--dark .v-main {
    background: #171512 !important;
}

html.hark-preset-hark .v-application.theme--dark .panel,
html.hark-preset-hark .v-application.theme--dark .v-navigation-drawer,
html.hark-preset-hark .v-application.theme--dark .v-app-bar.v-toolbar {
    background-color: #211e1a !important;
}

html.hark-preset-hark .v-application.theme--dark .panel .panel-toolbar {
    background-color: #2a2621 !important;
    border-bottom: 2px solid var(--color-primary);
}

html.hark-preset-hark .v-application.theme--dark,
html.hark-preset-hark .v-application.theme--dark .v-card__text {
    color: #f3efe6;
}

html.hark-preset-hark .v-application.theme--dark .panel-toolbar .subheading {
    letter-spacing: 0.02em;
    font-weight: 600;
}

/* Glass: deep gradient behind translucent cards. */
html.hark-preset-glass .v-application.theme--dark,
html.hark-preset-glass .v-application.theme--dark .v-main {
    background: radial-gradient(circle at 85% 0%, #1d3b5c 0, #0c1422 55%, #070b13 100%) fixed !important;
}

html.hark-preset-glass .v-application.theme--dark .v-navigation-drawer,
html.hark-preset-glass .v-application.theme--dark .v-app-bar.v-toolbar {
    background-color: rgba(10, 18, 32, 0.75) !important;
    backdrop-filter: blur(12px);
}

/* High contrast: black, white and a strong accent. */
html.hark-preset-contrast {
    --hark-border: #ffffff;
}

html.hark-preset-contrast .v-application.theme--dark,
html.hark-preset-contrast .v-application.theme--dark .v-main,
html.hark-preset-contrast .v-application.theme--dark .panel,
html.hark-preset-contrast .v-application.theme--dark .v-navigation-drawer,
html.hark-preset-contrast .v-application.theme--dark .v-app-bar.v-toolbar {
    background-color: #000000 !important;
    color: #ffffff;
}

html.hark-preset-contrast .v-application.theme--dark .panel {
    border-width: 2px !important;
}
</style>
