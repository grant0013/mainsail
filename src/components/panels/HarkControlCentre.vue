<template>
    <v-card v-if="klipperReadyForGui" class="hark-control-centre panel" :class="'hark-cc--' + jobState">
        <v-row no-gutters align="stretch">
            <v-col cols="12" md="5" class="d-flex align-center pa-4">
                <div class="hark-cc-thumb mr-4">
                    <img v-if="thumbnail" :src="thumbnail" alt="" />
                    <v-icon v-else size="56">{{ mdiPrinter3d }}</v-icon>
                </div>
                <div class="hark-cc-job">
                    <v-chip small label :color="stateColour" class="mb-2 text-uppercase font-weight-bold">
                        {{ stateLabel }}
                    </v-chip>
                    <div class="hark-cc-filename text-truncate" :title="filename">
                        {{ filename || 'Ready to print' }}
                    </div>
                    <div class="hark-cc-meta">
                        <span v-if="isActive">Layer {{ currentLayer }} / {{ maxLayers }}</span>
                        <span v-if="zHeight !== null">Z {{ zHeight }} mm</span>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" sm="5" md="3" class="d-flex align-center justify-center pa-4">
                <v-progress-circular
                    :value="isActive ? percent : 0"
                    :size="132"
                    :width="11"
                    :color="isActive ? 'primary' : 'grey darken-2'"
                    class="hark-cc-ring">
                    <div class="text-center">
                        <div class="hark-cc-percent">{{ isActive ? percent + '%' : '--' }}</div>
                        <div v-if="isActive" class="hark-cc-eta">ETA {{ eta }}</div>
                        <div v-if="isActive" class="hark-cc-eta">{{ elapsed }} elapsed</div>
                    </div>
                </v-progress-circular>
            </v-col>

            <v-col cols="12" sm="7" md="4" class="pa-4">
                <div class="hark-cc-actions">
                    <v-btn v-if="jobState === 'printing'" large depressed color="warning" @click="send('PAUSE')">
                        <v-icon left>{{ mdiPause }}</v-icon>
                        Pause
                    </v-btn>
                    <v-btn v-if="jobState === 'paused'" large depressed color="primary" @click="send('RESUME')">
                        <v-icon left>{{ mdiPlay }}</v-icon>
                        Resume
                    </v-btn>
                    <v-btn v-if="isActive" large depressed color="error" @click="confirmCancel = true">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        Cancel
                    </v-btn>
                    <v-btn v-if="!isActive" large depressed :disabled="printerIsPrinting" @click="send('G28')">
                        <v-icon left>{{ mdiHome }}</v-icon>
                        Home
                    </v-btn>
                    <v-btn v-if="!isActive" large depressed @click="send('TURN_OFF_HEATERS')">
                        <v-icon left>{{ mdiSnowflake }}</v-icon>
                        Cooldown
                    </v-btn>
                    <v-btn v-if="lightPin" large depressed :color="lightOn ? 'primary' : undefined" @click="toggleLight">
                        <v-icon left>{{ lightOn ? mdiLightbulbOn : mdiLightbulbOutline }}</v-icon>
                        Light
                    </v-btn>
                    <v-btn large depressed to="/files">
                        <v-icon left>{{ mdiFileDocumentMultipleOutline }}</v-icon>
                        Files
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <v-divider />

        <div class="hark-cc-tiles pa-3">
            <v-menu
                v-for="tile in heaterTiles"
                :key="tile.heater"
                offset-y
                :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                    <div class="hark-cc-tile hark-cc-tile--button" v-bind="attrs" v-on="on">
                        <div class="hark-cc-tile-label">
                            <v-icon small>{{ tile.icon }}</v-icon>
                            {{ tile.label }}
                        </div>
                        <div class="hark-cc-tile-value">{{ tile.temperature }}&deg;</div>
                        <div class="hark-cc-tile-sub">{{ tile.target > 0 ? '→ ' + tile.target + '°' : 'off' }}</div>
                    </div>
                </template>
                <v-card class="pa-3" min-width="220">
                    <div class="subtitle-2 mb-2">{{ tile.label }} target</div>
                    <div class="d-flex flex-wrap" style="gap: 6px">
                        <v-btn
                            v-for="preset in tile.presets"
                            :key="preset.label"
                            small
                            depressed
                            @click="setTemp(tile.heater, preset.value)">
                            {{ preset.label }}
                        </v-btn>
                    </div>
                    <v-text-field
                        v-model.number="customTemps[tile.heater]"
                        class="mt-3"
                        type="number"
                        label="Custom"
                        suffix="°C"
                        outlined
                        dense
                        hide-details
                        @keyup.enter="setTemp(tile.heater, customTemps[tile.heater])" />
                </v-card>
            </v-menu>
            <div v-if="chamber !== null" class="hark-cc-tile">
                <div class="hark-cc-tile-label">
                    <v-icon small>{{ mdiHomeThermometerOutline }}</v-icon>
                    Chamber
                </div>
                <div class="hark-cc-tile-value">{{ chamber }}&deg;</div>
                <div class="hark-cc-tile-sub">&nbsp;</div>
            </div>
            <div v-if="cfsTemp !== null" class="hark-cc-tile">
                <div class="hark-cc-tile-label">
                    <v-icon small>{{ mdiWaterPercent }}</v-icon>
                    CFS
                </div>
                <div class="hark-cc-tile-value">{{ cfsTemp }}&deg;</div>
                <div class="hark-cc-tile-sub" :class="{ 'warning--text': cfsHumidity >= 45 }">
                    {{ cfsHumidity }}% RH
                </div>
            </div>
        </div>

        <v-dialog v-model="confirmCancel" max-width="380">
            <v-card>
                <v-card-title class="text-h6">Cancel this print?</v-card-title>
                <v-card-text>{{ filename }} will stop and cannot be resumed.</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="confirmCancel = false">Keep printing</v-btn>
                    <v-btn color="error" depressed @click="cancelPrint">Cancel print</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { escapePath } from '@/plugins/helpers'
import {
    mdiFileDocumentMultipleOutline,
    mdiHome,
    mdiHomeThermometerOutline,
    mdiLightbulbOn,
    mdiLightbulbOutline,
    mdiPause,
    mdiPlay,
    mdiPrinter3d,
    mdiPrinter3dNozzle,
    mdiRadiator,
    mdiSnowflake,
    mdiStop,
    mdiWaterPercent,
} from '@mdi/js'

const LIGHT_PINS = ['output_pin chamber_led', 'output_pin LED', 'output_pin caselight']

@Component
export default class HarkControlCentre extends Mixins(BaseMixin) {
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiHome = mdiHome
    mdiHomeThermometerOutline = mdiHomeThermometerOutline
    mdiLightbulbOn = mdiLightbulbOn
    mdiLightbulbOutline = mdiLightbulbOutline
    mdiPause = mdiPause
    mdiPlay = mdiPlay
    mdiPrinter3d = mdiPrinter3d
    mdiSnowflake = mdiSnowflake
    mdiStop = mdiStop
    mdiWaterPercent = mdiWaterPercent

    confirmCancel = false
    customTemps: Record<string, number | null> = { extruder: null, heater_bed: null }

    get printer(): Record<string, any> {
        return this.$store.state.printer ?? {}
    }

    get jobState(): string {
        return this.printer.print_stats?.state ?? 'standby'
    }

    get isActive(): boolean {
        return this.jobState === 'printing' || this.jobState === 'paused'
    }

    get stateLabel(): string {
        const labels: Record<string, string> = {
            standby: 'Ready',
            printing: 'Printing',
            paused: 'Paused',
            complete: 'Complete',
            cancelled: 'Cancelled',
            error: 'Error',
        }
        return labels[this.jobState] ?? this.jobState
    }

    get stateColour(): string | undefined {
        const colours: Record<string, string> = {
            printing: 'primary',
            paused: 'warning',
            complete: 'success',
            cancelled: 'grey',
            error: 'error',
        }
        return colours[this.jobState]
    }

    get filename(): string {
        return this.printer.print_stats?.filename ?? ''
    }

    get percent(): number {
        return Math.floor((this.$store.getters['printer/getPrintPercent'] ?? 0) * 100)
    }

    get eta(): string {
        return this.$store.getters['printer/getEstimatedTimeETAFormat'] ?? '--'
    }

    get elapsed(): string {
        const stats = this.printer.print_stats ?? {}
        const seconds = Math.min(stats.print_duration ?? 0, stats.total_duration ?? 0)
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return h ? `${h}h ${m}m` : `${m}m`
    }

    get currentLayer(): number {
        return this.$store.getters['printer/getPrintCurrentLayer'] ?? 0
    }

    get maxLayers(): number {
        return this.$store.getters['printer/getPrintMaxLayers'] ?? 0
    }

    get zHeight(): string | null {
        const z = this.printer.gcode_move?.gcode_position?.[2]
        return typeof z === 'number' ? z.toFixed(2) : null
    }

    get thumbnail(): string {
        const file = this.printer.current_file ?? {}
        const thumbs = file.thumbnails ?? []
        if (!thumbs.length) return ''

        const best = [...thumbs].sort((a, b) => b.width - a.width)[0]
        if (!best?.relative_path) return ''

        const dir = file.filename?.includes('/') ? file.filename.substr(0, file.filename.lastIndexOf('/') + 1) : ''
        return `${this.apiUrl}/server/files/gcodes/${escapePath(dir + best.relative_path)}?timestamp=${file.modified}`
    }

    get heaterTiles() {
        const tiles = []
        const extruder = this.printer.extruder
        const bed = this.printer.heater_bed

        if (extruder) {
            tiles.push({
                heater: 'extruder',
                label: 'Nozzle',
                icon: mdiPrinter3dNozzle,
                temperature: Math.round(extruder.temperature ?? 0),
                target: Math.round(extruder.target ?? 0),
                presets: [
                    { label: 'Off', value: 0 },
                    { label: 'PLA 220', value: 220 },
                    { label: 'PETG 250', value: 250 },
                    { label: 'ABS 260', value: 260 },
                ],
            })
        }
        if (bed) {
            tiles.push({
                heater: 'heater_bed',
                label: 'Bed',
                icon: mdiRadiator,
                temperature: Math.round(bed.temperature ?? 0),
                target: Math.round(bed.target ?? 0),
                presets: [
                    { label: 'Off', value: 0 },
                    { label: 'PLA 60', value: 60 },
                    { label: 'PETG 70', value: 70 },
                    { label: 'ABS 100', value: 100 },
                ],
            })
        }
        return tiles
    }

    get chamber(): number | null {
        const sensor = this.printer['temperature_sensor chamber_temperature']
        return typeof sensor?.temperature === 'number' ? Math.round(sensor.temperature) : null
    }

    get cfsTemp(): number | null {
        const cfs = this.printer.k2_cfs
        return typeof cfs?.temperature === 'number' ? cfs.temperature : null
    }

    get cfsHumidity(): number {
        return this.printer.k2_cfs?.humidity ?? 0
    }

    get lightPin(): string | null {
        return LIGHT_PINS.find((name) => name in this.printer) ?? null
    }

    get lightOn(): boolean {
        return !!(this.lightPin && this.printer[this.lightPin]?.value > 0)
    }

    send(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    setTemp(heater: string, value: number | null) {
        if (value === null || value === undefined || isNaN(value)) return
        this.send(`SET_HEATER_TEMPERATURE HEATER=${heater} TARGET=${Math.max(0, Math.round(value))}`)
    }

    toggleLight() {
        if (!this.lightPin) return
        const pin = this.lightPin.replace('output_pin ', '')
        this.send(`SET_PIN PIN=${pin} VALUE=${this.lightOn ? 0 : 1}`)
    }

    cancelPrint() {
        this.confirmCancel = false
        this.send('CANCEL_PRINT')
    }
}
</script>

<style scoped>
.hark-control-centre {
    overflow: hidden;
}

.hark-cc-thumb {
    width: 104px;
    height: 104px;
    flex: 0 0 104px;
    border-radius: var(--hark-radius, 8px);
    background: rgba(128, 128, 128, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hark-cc-thumb img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.hark-cc-job {
    min-width: 0;
}

.hark-cc-filename {
    font-size: 1.15rem;
    font-weight: 600;
    line-height: 1.3;
}

.hark-cc-meta {
    opacity: 0.7;
    font-size: 0.85rem;
}

.hark-cc-meta span + span::before {
    content: '·';
    margin: 0 6px;
}

.hark-cc-percent {
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1;
}

.hark-cc-eta {
    font-size: 0.75rem;
    opacity: 0.75;
    margin-top: 2px;
}

.hark-cc-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.hark-cc-actions .v-btn {
    width: 100%;
}

.hark-cc-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}

.hark-cc-tile {
    border: 1px solid rgba(128, 128, 128, 0.25);
    border-radius: var(--hark-radius, 8px);
    padding: 10px 12px;
}

.hark-cc-tile--button {
    cursor: pointer;
}

.hark-cc-tile--button:hover {
    border-color: var(--color-primary, #2196f3);
}

.hark-cc-tile-label {
    font-size: 0.8rem;
    opacity: 0.75;
}

.hark-cc-tile-value {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.2;
}

.hark-cc-tile-sub {
    font-size: 0.8rem;
    opacity: 0.75;
}
</style>
