<template>
  <div>
    <p v-if="loading">Učitavam...</p>

    <div v-else-if="!found">
      <p>Ljubimac <strong>{{ id }}</strong> nije pronađen u Home Assistantu.</p>
      <RouterLink to="/">← Natrag</RouterLink>
    </div>

    <div v-else>
      <RouterLink to="/">← Natrag</RouterLink>
      <h1>{{ plushie.name }}</h1>
      <p><small>ID: {{ id }}</small></p>

      <img src="/images/medo.png" width="10%" />

      <p>
        Sreća:
        <span v-for="n in 3" :key="n" class="dot">{{ n <= plushie.happiness ? '●' : '○' }}</span>
        — <em>{{ happinessLabel }}</em>
      </p>

      <p v-if="refreshMsg" class="status-msg">{{ refreshMsg }}</p>

      <button :disabled="refreshing" @click="doRefresh">
        {{ refreshing ? 'Osvježavam...' : '↻ Osvježi' }}
      </button>

      <br /><br />

      <div v-if="!editingName">
        <button @click="startEdit">Preimenuj</button>
      </div>
      <div v-else>
        <input
          v-model="tempName"
          placeholder="Novo ime..."
          @keyup.enter="saveName"
          @keyup.escape="editingName = false"
        />
        <button @click="saveName" :disabled="!tempName.trim() || saving">
          {{ saving ? 'Spremam...' : 'Spremi' }}
        </button>
        <button @click="editingName = false">Odustani</button>
      </div>

      <p v-if="statusMsg" class="status-msg">{{ statusMsg }}</p>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { getPlushie, refreshPlushie, renamePlushie } from '../homeAssistant.js'

const POLL_INTERVAL_MS = 10000

export default {
  components: { RouterLink },
  props: ['id'],
  data() {
    return {
      loading: true,
      found: false,
      plushie: null,
      editingName: false,
      tempName: '',
      saving: false,
      refreshing: false,
      statusMsg: '',
      refreshMsg: '',
      pollTimer: null,
    }
  },
  computed: {
    happinessLabel() {
      return (
        { 1: 'Tužan sam :(', 2: 'OK sam :/', 3: 'Sretan sam :D' }[
          this.plushie?.happiness
        ] ?? ''
      )
    },
  },
  async mounted() {
    const p = await getPlushie(this.id)
    if (p) {
      this.found = true
      this.plushie = { ...p }
    }
    this.loading = false

    if (this.found) {
      this.pollTimer = setInterval(() => this.silentRefresh(), POLL_INTERVAL_MS)
    }
  },
  beforeUnmount() {
    clearInterval(this.pollTimer)
  },
  methods: {
    async silentRefresh() {
      try {
        const p = await refreshPlushie(this.id)
        if (p) {
          this.plushie.happiness = p.happiness
          if (!this.editingName) this.plushie.name = p.name
        }
      } catch { }
    },
    async doRefresh() {
      this.refreshing = true
      this.refreshMsg = ''
      try {
        const p = await refreshPlushie(this.id)
        if (p) {
          this.plushie = { ...p }
          this.refreshMsg = 'Osvježeno'
          setTimeout(() => { this.refreshMsg = '' }, 2000)
        }
      } catch (e) {
        this.refreshMsg = 'Greška: ' + e.message
      }
      this.refreshing = false
    },
    startEdit() {
      this.tempName = this.plushie.name
      this.editingName = true
      this.statusMsg = ''
      this.$nextTick(() => this.$el.querySelector('input')?.focus())
    },
    async saveName() {
      if (!this.tempName.trim()) return
      this.saving = true
      this.statusMsg = ''
      try {
        await renamePlushie(this.id, this.tempName.trim())
        this.plushie.name = this.tempName.trim()
        this.statusMsg = 'Ime spremljeno'
      } catch (e) {
        this.statusMsg = 'Greška: ' + e.message
      }
      this.editingName = false
      this.saving = false
      setTimeout(() => { this.statusMsg = '' }, 3000)
    },
  },
}
</script>

<style scoped>
.dot { font-size: 1.2em; letter-spacing: 2px; }
.status-msg { font-size: 0.9em; color: #555; }
</style>
