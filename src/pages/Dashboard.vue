<template>
    <div>
        <hark-control-centre v-if="showHarkControlCentre" class="mb-3 mb-md-6" />
        <div class="d-flex align-center justify-end flex-wrap mb-2">
            <span v-if="editLayout" class="caption mr-3 my-1">
                Drag cards by their coloured bar to move them, and use the eye to hide or show them. Changes save
                as you go.
            </span>
            <v-btn small :depressed="editLayout" :text="!editLayout" :color="editLayout ? 'primary' : undefined" @click="editLayout = !editLayout">
                <v-icon small left>{{ editLayout ? mdiCheck : mdiViewDashboardEditOutline }}</v-icon>
                {{ editLayout ? 'Done' : 'Edit layout' }}
            </v-btn>
        </div>
        <v-row v-if="isMobile">
            <v-col>
                <status-panel />
                <hark-dashboard-column viewport="mobile" :column="0" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-mobileLayout-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
        </v-row>
        <v-row v-else-if="isTablet">
            <v-col class="col-6">
                <status-panel />
                <hark-dashboard-column viewport="tablet" :column="1" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-tabletLayout1-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
            <v-col class="col-6">
                <hark-dashboard-column viewport="tablet" :column="2" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-tabletLayout2-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
        </v-row>
        <v-row v-else-if="isDesktop">
            <v-col class="col-5">
                <status-panel />
                <hark-dashboard-column viewport="desktop" :column="1" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-desktopLayout1-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
            <v-col class="col-7">
                <hark-dashboard-column viewport="desktop" :column="2" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-desktopLayout2-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
        </v-row>
        <v-row v-else-if="isWidescreen">
            <v-col class="col-3">
                <status-panel />
                <hark-dashboard-column viewport="widescreen" :column="1" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-widescreenLayout1-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
            <v-col class="col-5">
                <hark-dashboard-column viewport="widescreen" :column="2" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-widescreenLayout2-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
            <v-col class="col-4">
                <hark-dashboard-column viewport="widescreen" :column="3" :edit="editLayout">
                    <template #panel="{ panelName }">
                        <component
                            :is="extractPanelName(panelName)"
                            :key="'dashboard-widescreenLayout3-' + panelName"
                            :panel-id="extractPanelId(panelName)"></component>
                    </template>
                </hark-dashboard-column>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import AfcPanel from '@/components/panels/AfcPanel.vue'
import CfsPanel from '@/components/panels/CfsPanel.vue'
import ExtruderControlPanel from '@/components/panels/ExtruderControlPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import LedEffectsPanel from '@/components/panels/LedEffectsPanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import SpoolmanPanel from '@/components/panels/SpoolmanPanel.vue'
import MmuPanel from '@/components/panels/MmuPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import ToolheadControlPanel from '@/components/panels/ToolheadControlPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'
import HarkControlCentre from '@/components/panels/HarkControlCentre.vue'
import HarkDashboardColumn from '@/components/HarkDashboardColumn.vue'
import { mdiCheck, mdiViewDashboardEditOutline } from '@mdi/js'

@Component({
    components: {
        AfcPanel,
        CfsPanel,
        ExtruderControlPanel,
        KlippyStatePanel,
        LedEffectsPanel,
        MachineSettingsPanel,
        MacrogroupPanel,
        MacrosPanel,
        MiniconsolePanel,
        MinSettingsPanel,
        MiscellaneousPanel,
        SpoolmanPanel,
        MmuPanel,
        StatusPanel,
        ToolheadControlPanel,
        TemperaturePanel,
        WebcamPanel,
        HarkControlCentre,
        HarkDashboardColumn,
    },
})
export default class PageDashboard extends Mixins(DashboardMixin) {
    mdiCheck = mdiCheck
    mdiViewDashboardEditOutline = mdiViewDashboardEditOutline
    editLayout = false

    get showHarkControlCentre(): boolean {
        return this.$store.state.gui.hark?.controlCentre ?? true
    }

    get mobileLayout() {
        return this.$store.getters['gui/getPanels']('mobile', 0, true)
    }

    get tabletLayout1() {
        return this.$store.getters['gui/getPanels']('tablet', 1, true)
    }

    get tabletLayout2() {
        return this.$store.getters['gui/getPanels']('tablet', 2, true)
    }

    get desktopLayout1() {
        return this.$store.getters['gui/getPanels']('desktop', 1, true)
    }

    get desktopLayout2() {
        return this.$store.getters['gui/getPanels']('desktop', 2, true)
    }

    get widescreenLayout1() {
        return this.$store.getters['gui/getPanels']('widescreen', 1, true)
    }

    get widescreenLayout2() {
        return this.$store.getters['gui/getPanels']('widescreen', 2, true)
    }

    get widescreenLayout3() {
        return this.$store.getters['gui/getPanels']('widescreen', 3, true)
    }

    extractPanelName(name: string) {
        return name.split('_')[0] + '-panel'
    }

    extractPanelId(name: string) {
        return name.split('_')[1] ?? null
    }
}
</script>
