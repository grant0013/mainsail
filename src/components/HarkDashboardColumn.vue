<template>
    <div class="hark-dash-column" :class="{ 'hark-dash-column--edit': edit }">
        <template v-if="!edit">
            <template v-for="item in visiblePanels">
                <slot name="panel" :panel-name="item.name" />
            </template>
        </template>
        <draggable
            v-else
            v-model="layout"
            :group="'hark-' + viewport"
            handle=".hark-drag-handle"
            ghost-class="hark-drag-ghost"
            :force-fallback="true"
            :animation="180"
            class="hark-drag-list">
            <div
                v-for="item in layout"
                :key="'drag-' + item.name"
                class="hark-drag-item"
                :class="{ 'hark-drag-item--hidden': !item.visible }">
                <div class="hark-drag-handle">
                    <v-icon small class="mr-2">{{ mdiDrag }}</v-icon>
                    <span class="text-truncate">{{ getPanelName(item.name) }}</span>
                    <v-spacer />
                    <v-btn icon x-small :title="item.visible ? 'Hide card' : 'Show card'" @click.stop="toggle(item.name)">
                        <v-icon small>{{ item.visible ? mdiEye : mdiEyeOff }}</v-icon>
                    </v-btn>
                </div>
                <div v-if="item.visible" class="hark-drag-preview">
                    <slot name="panel" :panel-name="item.name" />
                </div>
            </div>
        </draggable>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import { mdiDrag, mdiEye, mdiEyeOff } from '@mdi/js'
import DashboardMixin from '@/components/mixins/dashboard'
import type { GuiStateLayoutoption } from '@/store/gui/types'

// One dashboard column. In edit mode its cards can be dragged within and
// between the columns of the current viewport and shown or hidden; changes
// are saved to the same layout settings as Settings > Dashboard.
@Component({
    components: { draggable },
})
export default class HarkDashboardColumn extends Mixins(DashboardMixin) {
    mdiDrag = mdiDrag
    mdiEye = mdiEye
    mdiEyeOff = mdiEyeOff

    @Prop({ type: String, required: true }) declare readonly viewport: string
    @Prop({ type: Number, default: 1 }) declare readonly column: number
    @Prop({ type: Boolean, default: false }) declare readonly edit: boolean

    get layoutName(): string {
        return this.column ? `${this.viewport}Layout${this.column}` : `${this.viewport}Layout`
    }

    get layout(): GuiStateLayoutoption[] {
        return this.$store.getters['gui/getPanels'](this.viewport, this.column) as GuiStateLayoutoption[]
    }

    set layout(value: Array<GuiStateLayoutoption | undefined>) {
        this.$store.dispatch('gui/saveSetting', {
            name: `dashboard.${this.layoutName}`,
            value: value.filter((element) => element !== undefined),
        })
    }

    get visiblePanels(): GuiStateLayoutoption[] {
        return this.$store.getters['gui/getPanels'](this.viewport, this.column, true) as GuiStateLayoutoption[]
    }

    toggle(name: string) {
        this.layout = this.layout.map((element) =>
            element.name === name ? { ...element, visible: !element.visible } : element
        )
    }
}
</script>

<style scoped>
.hark-dash-column--edit {
    min-height: 120px;
    border: 2px dashed rgba(128, 128, 128, 0.4);
    border-radius: var(--hark-radius, 8px);
    padding: 8px;
}

.hark-drag-list {
    min-height: 100px;
}

.hark-drag-item {
    margin-bottom: 12px;
    border-radius: var(--hark-radius, 8px);
    background: rgba(128, 128, 128, 0.08);
}

.hark-drag-item--hidden {
    opacity: 0.55;
}

.hark-drag-handle {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: grab;
    font-weight: 600;
    user-select: none;
    background: var(--color-primary, #2196f3);
    color: #fff;
    border-radius: var(--hark-radius, 8px) var(--hark-radius, 8px) 0 0;
}

.hark-drag-item--hidden .hark-drag-handle {
    background: rgba(128, 128, 128, 0.5);
    border-radius: var(--hark-radius, 8px);
}

.hark-drag-handle .v-icon,
.hark-drag-handle .v-btn {
    color: inherit !important;
}

/* Cards are previewed scaled down and non-interactive while arranging. */
.hark-drag-preview {
    max-height: 180px;
    overflow: hidden;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent);
    mask-image: linear-gradient(to bottom, #000 70%, transparent);
}

.hark-drag-ghost {
    opacity: 0.4;
}
</style>
