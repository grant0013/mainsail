<template>
    <div>
        <panel
            v-if="klipperReadyForGui"
            title="CFS"
            :icon="mdiPrinter3dNozzle"
            :collapsible="true"
            card-class="cfs-panel">
            <template #buttons>
                <v-chip v-if="temperature !== null" small label class="mr-1">
                    <v-icon small left>{{ mdiThermometer }}</v-icon>
                    {{ temperature }}&deg;C
                </v-chip>
                <v-chip v-if="humidity !== null" small label class="mr-2" :color="humidityColor">
                    <v-icon small left>{{ mdiWaterPercent }}</v-icon>
                    {{ humidity }}%
                </v-chip>
            </template>
            <v-card-text>
                <v-row dense>
                    <v-col v-for="item in slots" :key="item.id" cols="6" sm="3">
                        <v-card
                            outlined
                            class="cfs-slot pa-2 text-center"
                            :class="{ 'cfs-slot--active': item.active }"
                            @click="openEditor(item)">
                            <div
                                class="cfs-swatch mx-auto mb-2"
                                :class="{ 'cfs-swatch--empty': !item.loaded }"
                                :style="swatchStyle(item)">
                                {{ item.id }}
                            </div>
                            <div class="subtitle-2 text-truncate">{{ item.loaded ? item.name : 'Empty' }}</div>
                            <div class="caption text--secondary text-truncate">
                                {{ item.loaded ? item.type : '&nbsp;' }}
                            </div>
                            <div class="caption text--secondary text-truncate">
                                <template v-if="item.loaded && item.max_temp">
                                    {{ item.min_temp }}-{{ item.max_temp }}&deg;C
                                </template>
                                <template v-else>&nbsp;</template>
                            </div>
                            <v-chip v-if="item.active" x-small color="primary" class="mt-1">In use</v-chip>
                            <v-chip
                                v-else-if="item.sensed === false && item.loaded"
                                x-small
                                color="warning"
                                class="mt-1">
                                Not detected
                            </v-chip>
                        </v-card>
                    </v-col>
                </v-row>
                <div class="caption text--secondary mt-2">
                    <span v-if="cfs.online === false">CFS not responding &middot;</span>
                    <span v-if="cfs.buffer">Buffer {{ cfs.buffer }} &middot;</span>
                    <span v-if="cfs.firmware">Firmware {{ cfs.firmware }} &middot;</span>
                    Click a slot to change its filament.
                </div>
            </v-card-text>
        </panel>

        <v-dialog v-model="dialogOpen" max-width="560" :fullscreen="isMobile">
            <panel
                v-if="editing"
                :key="editKey"
                :title="`CFS slot ${editing.id}`"
                :icon="mdiPrinter3dNozzle"
                card-class="cfs-slot-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="4">
                            <v-select
                                v-model="form.type"
                                :items="types"
                                label="Type"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                        <v-col cols="12" sm="8">
                            <v-combobox
                                v-model="form.name"
                                :items="namesForType"
                                label="Material"
                                outlined
                                dense
                                hide-details="auto"
                                @change="handleMaterial" />
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-text-field v-model="form.brand" label="Brand" outlined dense hide-details="auto" />
                        </v-col>
                        <v-col cols="6" sm="4">
                            <v-text-field
                                v-model.number="form.minTemp"
                                label="Min temp"
                                suffix="°C"
                                type="number"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                        <v-col cols="6" sm="4">
                            <v-text-field
                                v-model.number="form.maxTemp"
                                label="Max temp"
                                suffix="°C"
                                type="number"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                        <v-col cols="12">
                            <div class="caption text--secondary mb-1">Colour</div>
                            <v-color-picker
                                v-model="form.colour"
                                mode="hexa"
                                hide-mode-switch
                                show-swatches
                                :swatches="swatches"
                                swatches-max-height="120"
                                width="100%"
                                canvas-height="100" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="warning" @click="clearSlot">Mark empty</v-btn>
                    <v-spacer />
                    <v-btn text @click="dialogOpen = false">Cancel</v-btn>
                    <v-btn color="primary" text :disabled="!canSave" @click="saveSlot">Save</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiPrinter3dNozzle, mdiThermometer, mdiWaterPercent } from '@mdi/js'

interface CfsMaterial {
    filament_id: string
    name: string
    brand: string
    type: string
    min_temp: number
    max_temp: number
}

interface CfsSlot {
    id: string
    loaded: boolean
    type: string
    name: string
    brand: string
    color: string
    min_temp: number
    max_temp: number
    active: boolean
    sensed?: boolean
}

const SLOT_IDS = ['A', 'B', 'C', 'D']
const TYPE_ORDER = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PLA-CF', 'PETG-CF']

@Component({
    components: { Panel },
})
export default class CfsPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiThermometer = mdiThermometer
    mdiWaterPercent = mdiWaterPercent

    dialogOpen = false
    editKey = 0
    editing: CfsSlot | null = null
    form = { type: 'PLA', name: '', brand: '', minTemp: 0, maxTemp: 0, colour: '#FFFFFF' }

    swatches = [
        ['#000000', '#808080', '#C0C0C0', '#FFFFFF'],
        ['#E53935', '#FB8C00', '#FDD835', '#FFC107'],
        ['#43A047', '#C0CA33', '#26EEEE', '#1E88E5'],
        ['#1A237E', '#8E24AA', '#EC407A', '#6D4C41'],
    ]

    get cfs(): Record<string, any> {
        return this.$store.state.printer?.k2_cfs ?? {}
    }

    get store(): Record<string, any> {
        return this.$store.state.printer?.hark_cfs_slots ?? {}
    }

    get materials(): CfsMaterial[] {
        return this.store.materials ?? []
    }

    get temperature(): number | null {
        return typeof this.cfs.temperature === 'number' ? this.cfs.temperature : null
    }

    get humidity(): number | null {
        return typeof this.cfs.humidity === 'number' ? this.cfs.humidity : null
    }

    get humidityColor(): string | undefined {
        if (this.humidity === null) return undefined
        if (this.humidity >= 60) return 'error'
        if (this.humidity >= 45) return 'warning'
        return undefined
    }

    get slots(): CfsSlot[] {
        const records = this.store.slots ?? {}
        const sensed: boolean[] | undefined = this.cfs.slots_loaded

        return SLOT_IDS.map((id, index) => ({
            loaded: false,
            type: '',
            name: '',
            brand: '',
            color: '',
            min_temp: 0,
            max_temp: 0,
            ...records[id],
            id,
            active: this.cfs.active_slot === id,
            sensed: sensed ? sensed[index] : undefined,
        }))
    }

    get types(): string[] {
        const present = Array.from(new Set(this.materials.map((m) => m.type).filter(Boolean))).sort()
        const ordered = TYPE_ORDER.filter((t) => present.includes(t))
        const all = [...ordered, ...present.filter((t) => !ordered.includes(t))]

        if (this.form.type && !all.includes(this.form.type)) all.unshift(this.form.type)
        return all
    }

    get namesForType(): string[] {
        return this.materials
            .filter((m) => m.type === this.form.type)
            .sort(
                (a, b) =>
                    Number(a.brand !== 'Creality') - Number(b.brand !== 'Creality') || a.name.localeCompare(b.name)
            )
            .map((m) => m.name)
    }

    get colourHex(): string {
        return (this.form.colour || '#FFFFFF').replace('#', '').slice(0, 6).toUpperCase()
    }

    get canSave(): boolean {
        return !!(this.form.name && this.form.type && /^[0-9A-F]{6}$/.test(this.colourHex))
    }

    swatchStyle(item: CfsSlot) {
        if (!item.loaded) return {}

        const value = parseInt(item.color || '000000', 16)
        const luma = 0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)

        return { backgroundColor: '#' + item.color, color: luma > 150 ? '#000000' : '#ffffff' }
    }

    openEditor(item: CfsSlot) {
        this.editing = item
        this.form = {
            type: item.type || 'PLA',
            name: item.name || '',
            brand: item.brand || '',
            minTemp: item.min_temp || 0,
            maxTemp: item.max_temp || 0,
            colour: '#' + (item.color || 'FFFFFF'),
        }
        this.editKey++
        this.dialogOpen = true
    }

    handleMaterial(value: string) {
        const material = this.materials.find((m) => m.name === value)
        if (!material) return

        this.form.type = material.type
        this.form.brand = material.brand
        this.form.minTemp = material.min_temp
        this.form.maxTemp = material.max_temp
    }

    quote(value: string) {
        return '"' + (value ?? '').replace(/["#;]/g, '') + '"'
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    saveSlot() {
        if (!this.editing || !this.canSave) return

        const parts = [
            'CFS_SLOT_SET',
            `SLOT=${this.editing.id}`,
            `NAME=${this.quote(this.form.name)}`,
            `TYPE=${this.quote(this.form.type)}`,
            `BRAND=${this.quote(this.form.brand)}`,
            `COLOR=${this.colourHex}`,
        ]
        if (this.form.minTemp) parts.push(`MIN_TEMP=${this.form.minTemp}`)
        if (this.form.maxTemp) parts.push(`MAX_TEMP=${this.form.maxTemp}`)

        this.sendGcode(parts.join(' '))
        this.dialogOpen = false
    }

    clearSlot() {
        if (!this.editing) return

        this.sendGcode(`CFS_SLOT_CLEAR SLOT=${this.editing.id}`)
        this.dialogOpen = false
    }
}
</script>

<style scoped>
.cfs-slot {
    cursor: pointer;
}

.cfs-slot--active {
    border-color: var(--v-primary-base) !important;
    border-width: 2px;
}

.cfs-swatch {
    width: 48px;
    height: 48px;
    border-radius: 50% !important;
    border: 2px solid rgba(128, 128, 128, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
}

.cfs-swatch--empty {
    border-style: dashed;
}
</style>
