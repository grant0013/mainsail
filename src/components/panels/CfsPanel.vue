<template>
    <div>
        <panel
            v-if="klipperReadyForGui && hasCfs"
            title="CFS"
            :icon="mdiPrinter3dNozzle"
            :collapsible="true"
            card-class="cfs-panel">
            <template #buttons>
                <v-chip v-if="temperature !== null" small label class="mr-1">
                    <v-icon small left>{{ mdiThermometer }}</v-icon>
                    {{ temperature }}&deg;C
                </v-chip>
                <v-chip v-if="humidity !== null" small label class="mr-1" :color="humidityColor">
                    <v-icon small left>{{ mdiWaterPercent }}</v-icon>
                    {{ humidity }}%
                </v-chip>
                <v-btn icon tile title="Filament library" @click="libraryOpen = true">
                    <v-icon>{{ mdiBookshelf }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row dense>
                    <v-col v-for="item in slots" :key="item.id" cols="6" sm="3">
                        <v-card
                            outlined
                            class="cfs-slot pa-2 text-center"
                            :class="{ 'cfs-slot--active': item.active }"
                            @click="openSlotEditor(item)">
                            <div
                                class="cfs-swatch mx-auto mb-2"
                                :class="{ 'cfs-swatch--empty': !item.loaded }"
                                :style="swatchStyle(item.loaded ? item.color : '')">
                                {{ item.id }}
                            </div>
                            <div class="subtitle-2 text-truncate">{{ item.loaded ? item.name : 'Empty' }}</div>
                            <div class="caption text--secondary text-truncate">
                                {{ item.loaded ? item.type : '&nbsp;' }}
                            </div>
                            <div class="caption text--secondary text-truncate">
                                <template v-if="item.loaded && item.nozzle_temp">
                                    {{ item.nozzle_temp }}&deg;
                                    <span v-if="item.pressure_advance">&middot; PA {{ item.pressure_advance }}</span>
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

        <!-- Slot editor: pick a filament profile and the spool colour -->
        <v-dialog v-model="slotOpen" max-width="600" :fullscreen="isMobile">
            <panel
                v-if="editingSlot"
                :key="'slot-' + editKey"
                :title="`CFS slot ${editingSlot.id}`"
                :icon="mdiPrinter3dNozzle"
                card-class="cfs-slot-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="slotOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="4">
                            <v-select
                                v-model="slotForm.type"
                                :items="types"
                                label="Type"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                        <v-col cols="12" sm="8">
                            <v-autocomplete
                                v-model="slotForm.filament"
                                :items="filamentItems"
                                label="Filament"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                    </v-row>
                    <div v-if="selectedFilament" class="d-flex flex-wrap align-center mt-3" style="gap: 6px">
                        <v-chip v-for="chip in settingChips(selectedFilament)" :key="chip" small label>
                            {{ chip }}
                        </v-chip>
                        <v-spacer />
                        <v-btn small text color="primary" @click="openFilamentEditor(selectedFilament)">
                            <v-icon small left>{{ mdiPencil }}</v-icon>
                            {{ selectedFilament.source === 'creality' ? 'Customise' : 'Edit' }}
                        </v-btn>
                    </div>
                    <v-btn small outlined class="mt-3" @click="openFilamentEditor(null)">
                        <v-icon small left>{{ mdiPlus }}</v-icon>
                        Add new filament
                    </v-btn>
                    <div class="caption text--secondary mt-4 mb-1">Spool colour</div>
                    <v-color-picker
                        v-model="slotForm.colour"
                        mode="hexa"
                        hide-mode-switch
                        show-swatches
                        :swatches="swatches"
                        swatches-max-height="110"
                        width="100%"
                        canvas-height="90" />
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="warning" @click="clearSlot">Mark empty</v-btn>
                    <v-spacer />
                    <v-btn text @click="slotOpen = false">Cancel</v-btn>
                    <v-btn color="primary" text :disabled="!canSaveSlot" @click="saveSlot">Save</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- Filament profile editor -->
        <v-dialog v-model="filamentOpen" max-width="640" :fullscreen="isMobile">
            <panel
                :key="'fil-' + filamentKey"
                :title="filamentForm.id ? 'Edit filament' : 'New filament'"
                :icon="mdiPencil"
                card-class="cfs-filament-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="filamentOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <div v-if="filamentForm.base" class="caption text--secondary mb-3">
                        Based on {{ filamentForm.base }}. Saving creates your own copy; the original stays unchanged.
                    </div>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model="filamentForm.name" label="Name" outlined dense hide-details="auto" />
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-text-field v-model="filamentForm.brand" label="Brand" outlined dense hide-details="auto" />
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-combobox
                                v-model="filamentForm.type"
                                :items="types"
                                label="Type"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                        <v-col v-for="field in settingFields" :key="field.key" cols="6" sm="4">
                            <v-text-field
                                v-model.number="filamentForm[field.key]"
                                :label="field.label"
                                :suffix="field.suffix"
                                :step="field.step"
                                type="number"
                                outlined
                                dense
                                hide-details="auto" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="filamentForm.id" text color="error" @click="deleteFilament">Delete</v-btn>
                    <v-spacer />
                    <v-btn text @click="filamentOpen = false">Cancel</v-btn>
                    <v-btn color="primary" text :disabled="!filamentForm.name || !filamentForm.type" @click="saveFilament">
                        Save
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- Filament library -->
        <v-dialog v-model="libraryOpen" max-width="640" :fullscreen="isMobile" scrollable>
            <panel title="Filament library" :icon="mdiBookshelf" card-class="cfs-library-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="libraryOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text style="max-height: 70vh; overflow-y: auto">
                    <v-btn small outlined class="mb-3" @click="openFilamentEditor(null)">
                        <v-icon small left>{{ mdiPlus }}</v-icon>
                        Add new filament
                    </v-btn>
                    <div v-if="!library.length" class="caption text--secondary">
                        No filaments of your own yet. Add one, or customise a Creality profile from a slot.
                    </div>
                    <v-list dense class="pa-0">
                        <v-list-item v-for="fil in library" :key="fil.id" @click="openFilamentEditor(fil)">
                            <v-list-item-avatar size="24">
                                <div class="cfs-dot" :style="swatchStyle(fil.color || '888888')" />
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ fil.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ [fil.brand, fil.type].filter(Boolean).join(' · ') }} &middot;
                                    {{ settingChips(fil).join(' · ') }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiBookshelf,
    mdiCloseThick,
    mdiPencil,
    mdiPlus,
    mdiPrinter3dNozzle,
    mdiThermometer,
    mdiWaterPercent,
} from '@mdi/js'

interface CfsFilament {
    id: string
    source: string
    name: string
    brand: string
    type: string
    color: string
    [key: string]: any
}

interface CfsSlot extends CfsFilament {
    loaded: boolean
    filament: string
    active: boolean
    sensed?: boolean
}

const SLOT_IDS = ['A', 'B', 'C', 'D']
const TYPE_ORDER = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PLA-CF', 'PETG-CF']
// Field key, label, G-code parameter, suffix, step. Mirrors hark_cfs_slots.SETTINGS.
const SETTING_FIELDS = [
    { key: 'nozzle_temp', label: 'Nozzle temp', param: 'NOZZLE', suffix: '°C', step: 1 },
    { key: 'nozzle_first', label: 'First layer nozzle', param: 'NOZZLE_FIRST', suffix: '°C', step: 1 },
    { key: 'bed_temp', label: 'Bed temp', param: 'BED', suffix: '°C', step: 1 },
    { key: 'min_temp', label: 'Nozzle min', param: 'MIN_TEMP', suffix: '°C', step: 1 },
    { key: 'max_temp', label: 'Nozzle max', param: 'MAX_TEMP', suffix: '°C', step: 1 },
    { key: 'pressure_advance', label: 'Pressure advance', param: 'PA', suffix: '', step: 0.001 },
    { key: 'flow_ratio', label: 'Flow ratio', param: 'FLOW', suffix: '', step: 0.01 },
    { key: 'retract_length', label: 'Retraction', param: 'RETRACT', suffix: 'mm', step: 0.1 },
    { key: 'retract_speed', label: 'Retraction speed', param: 'RETRACT_SPEED', suffix: 'mm/s', step: 1 },
    { key: 'fan_min', label: 'Fan min', param: 'FAN_MIN', suffix: '%', step: 1 },
    { key: 'fan_max', label: 'Fan max', param: 'FAN_MAX', suffix: '%', step: 1 },
]

@Component({
    components: { Panel },
})
export default class CfsPanel extends Mixins(BaseMixin) {
    mdiBookshelf = mdiBookshelf
    mdiCloseThick = mdiCloseThick
    mdiPencil = mdiPencil
    mdiPlus = mdiPlus
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiThermometer = mdiThermometer
    mdiWaterPercent = mdiWaterPercent

    settingFields = SETTING_FIELDS
    swatches = [
        ['#000000', '#808080', '#C0C0C0', '#FFFFFF'],
        ['#E53935', '#FB8C00', '#FDD835', '#FFC107'],
        ['#43A047', '#C0CA33', '#26EEEE', '#1E88E5'],
        ['#1A237E', '#8E24AA', '#EC407A', '#6D4C41'],
    ]

    slotOpen = false
    editKey = 0
    editingSlot: CfsSlot | null = null
    slotForm = { type: 'PLA', filament: '', colour: '#FFFFFF' }

    libraryOpen = false
    filamentOpen = false
    filamentKey = 0
    filamentForm: Record<string, any> = {}
    pendingFilamentName = ''

    get hasCfs(): boolean {
        return !!this.$store.state.printer?.hark_cfs_slots
    }

    get cfs(): Record<string, any> {
        return this.$store.state.printer?.k2_cfs ?? {}
    }

    get store(): Record<string, any> {
        return this.$store.state.printer?.hark_cfs_slots ?? {}
    }

    get library(): CfsFilament[] {
        return [...(this.store.library ?? [])].sort((a, b) => a.name.localeCompare(b.name))
    }

    get filaments(): CfsFilament[] {
        return [...this.library, ...(this.store.materials ?? [])]
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
            ...records[id],
            id,
            active: this.cfs.active_slot === id,
            sensed: sensed ? sensed[index] : undefined,
        }))
    }

    get types(): string[] {
        const present = Array.from(new Set(this.filaments.map((m) => m.type).filter(Boolean))).sort()
        const ordered = TYPE_ORDER.filter((t) => present.includes(t))
        return [...ordered, ...present.filter((t) => !ordered.includes(t))]
    }

    get filamentItems() {
        const ofType = (source: (f: CfsFilament) => boolean) =>
            this.filaments
                .filter((f) => f.type === this.slotForm.type && source(f))
                .map((f) => ({ text: f.brand ? `${f.name} (${f.brand})` : f.name, value: f.id }))
        const mine = ofType((f) => f.source !== 'creality')
        const creality = ofType((f) => f.source === 'creality')
        return [
            ...(mine.length ? [{ header: 'My filaments' }, ...mine, { divider: true }] : []),
            { header: 'Creality' },
            ...creality,
        ]
    }

    get selectedFilament(): CfsFilament | undefined {
        return this.filaments.find((f) => f.id === this.slotForm.filament)
    }

    get canSaveSlot(): boolean {
        return !!this.selectedFilament && /^[0-9A-F]{6}$/.test(this.hex(this.slotForm.colour))
    }

    @Watch('library')
    onLibraryChanged() {
        // After creating a filament from the slot editor, select it there.
        if (!this.pendingFilamentName) return
        const created = this.library.find((f) => f.name === this.pendingFilamentName)
        if (created) {
            this.slotForm.type = created.type
            this.slotForm.filament = created.id
            this.pendingFilamentName = ''
        }
    }

    hex(colour: string) {
        return (colour || '#FFFFFF').replace('#', '').slice(0, 6).toUpperCase()
    }

    swatchStyle(colour: string) {
        if (!colour) return {}
        const value = parseInt(colour, 16)
        const luma = 0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)
        return { backgroundColor: '#' + colour, color: luma > 150 ? '#000000' : '#ffffff' }
    }

    settingChips(fil: Record<string, any>): string[] {
        const chips = []
        if (fil.nozzle_temp) chips.push(`Nozzle ${fil.nozzle_temp}°`)
        if (fil.bed_temp) chips.push(`Bed ${fil.bed_temp}°`)
        if (fil.pressure_advance) chips.push(`PA ${fil.pressure_advance}`)
        if (fil.flow_ratio) chips.push(`Flow ${fil.flow_ratio}`)
        return chips
    }

    openSlotEditor(item: CfsSlot) {
        this.editingSlot = item
        this.slotForm = {
            type: item.type || 'PLA',
            filament: item.filament || '',
            colour: '#' + (item.color || 'FFFFFF'),
        }
        this.editKey++
        this.slotOpen = true
    }

    openFilamentEditor(fil: CfsFilament | null) {
        const blank: Record<string, any> = { name: '', brand: '', type: this.slotForm.type || 'PLA', color: '' }
        SETTING_FIELDS.forEach((f) => (blank[f.key] = 0))

        if (!fil) {
            this.filamentForm = { ...blank, id: '', base: '' }
        } else if (fil.source === 'creality') {
            this.filamentForm = { ...blank, ...fil, id: '', base: fil.name, name: `${fil.name} (custom)` }
        } else {
            this.filamentForm = { ...blank, ...fil, base: '' }
        }
        this.filamentKey++
        this.filamentOpen = true
    }

    quote(value: string) {
        return '"' + (value ?? '').replace(/["#;]/g, '') + '"'
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    saveSlot() {
        if (!this.editingSlot || !this.canSaveSlot || !this.selectedFilament) return
        this.sendGcode(
            `CFS_SLOT_SET SLOT=${this.editingSlot.id} FILAMENT=${this.selectedFilament.id} ` +
                `COLOR=${this.hex(this.slotForm.colour)}`
        )
        this.slotOpen = false
    }

    clearSlot() {
        if (!this.editingSlot) return
        this.sendGcode(`CFS_SLOT_CLEAR SLOT=${this.editingSlot.id}`)
        this.slotOpen = false
    }

    saveFilament() {
        const f = this.filamentForm
        const parts = ['CFS_FILAMENT_SAVE']
        if (f.id) parts.push(`ID=${f.id}`)
        else if (f.base) parts.push(`BASE=${this.quote(f.base)}`)
        parts.push(`NAME=${this.quote(f.name)}`, `TYPE=${this.quote(String(f.type))}`, `BRAND=${this.quote(f.brand)}`)
        if (f.color) parts.push(`COLOR=${f.color}`)
        SETTING_FIELDS.forEach((field) => {
            const value = Number(f[field.key])
            if (!isNaN(value) && value >= 0) parts.push(`${field.param}=${value}`)
        })

        if (!f.id) this.pendingFilamentName = f.name
        this.sendGcode(parts.join(' '))
        this.filamentOpen = false
    }

    deleteFilament() {
        if (!this.filamentForm.id) return
        this.sendGcode(`CFS_FILAMENT_DELETE ID=${this.filamentForm.id}`)
        this.filamentOpen = false
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

.cfs-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid rgba(128, 128, 128, 0.5);
}
</style>
