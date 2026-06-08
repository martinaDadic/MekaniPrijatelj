<template>
  <div>
    <h1>Mekani prijatelj</h1>
    <p>Skeniraj QR kod ili unesi ID ljubimca.</p>

    <div v-if="!scanning && !pendingNew">
      <br />
      <button @click="startScan">Skeniraj QR</button>
      <br /><br />
      <input v-model="manualId" placeholder="ID ljubimca" @keyup.enter="loadManual" />
      <button @click="loadManual">Idi</button>
      <p v-if="errMsg" class="err">{{ errMsg }}</p>
    </div>

    <div v-if="scanning">
      <video ref="videoEl" autoplay playsinline style="width:100%;max-width:400px"></video>
      <p>{{ scanMsg }}</p>
      <button @click="stopScan">Odustani</button>
    </div>

    <div v-if="pendingNew">
      <p>
        Ljubimac <strong>{{ pendingId }}</strong> pronađen u Home Assistantu.<br />
        Daj mu ime da ga zapamtiš:
      </p>
      <label>
        Ime:
        <input
          v-model="newName"
          placeholder="Npr. Medo"
          @keyup.enter="saveNew"
        />
      </label>
      <br /><br />
      <button @click="saveNew" :disabled="!newName.trim() || saving">
        {{ saving ? 'Spremam...' : 'Kreiraj' }}
      </button>
      <button @click="cancelNew">Natrag</button>
      <p v-if="errMsg" class="err">{{ errMsg }}</p>
    </div>
  </div>
</template>

<script>
import { getPlushie, createPlushie } from '../homeAssistant.js'
import { useRouter } from 'vue-router'

export default {
  setup() {
    return { router: useRouter() }
  },
  data() {
    return {
      scanning: false,
      manualId: '',
      pendingNew: false,
      pendingId: '',
      newName: '',
      saving: false,
      errMsg: '',
      scanMsg: 'Usmjeri kameru prema QR kodu',
      stream: null,
      scanInterval: null,
    }
  },
  methods: {
    async startScan() {
      this.errMsg = ''
      this.scanning = true
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        await this.$nextTick()
        this.$refs.videoEl.srcObject = this.stream

        if (!('BarcodeDetector' in window)) {
          this.scanMsg = 'BarcodeDetector nije podržan — unesi ID ručno'
          return
        }
        const detector = new BarcodeDetector({ formats: ['qr_code'] })
        this.scanInterval = setInterval(async () => {
          try {
            const codes = await detector.detect(this.$refs.videoEl)
            if (codes.length > 0) this.handleScanned(codes[0].rawValue)
          } catch {}
        }, 500)
      } catch (e) {
        this.scanMsg = 'Greška kamere: ' + e.message
      }
    },
    stopScan() {
      clearInterval(this.scanInterval)
      if (this.stream) this.stream.getTracks().forEach(t => t.stop())
      this.scanning = false
      this.stream = null
    },
    handleScanned(raw) {
      this.stopScan()
      const id = raw.startsWith('plushie:') ? raw.slice(8) : raw
      this.load(id.trim())
    },
    loadManual() {
      if (!this.manualId.trim()) return
      this.load(this.manualId.trim())
    },
    async load(id) {
      this.errMsg = ''
      try {
        const existing = await getPlushie(id)
        if (existing) {
          const hasName = existing.name && existing.name !== `Ljubimac ${id}`
          if (hasName) {
            this.router.push(`/ljubimac/${id}`)
          } else {
            this.pendingId = id
            this.pendingNew = true
            this.newName = ''
          }
        } else {
          this.errMsg = `Ljubimac s ID-om "${id}" ne postoji u Home Assistantu.`
        }
      } catch (e) {
        this.errMsg = 'Greška veze s Home Assistantom: ' + e.message
      }
    },
    cancelNew() {
      this.pendingNew = false
      this.pendingId = ''
      this.newName = ''
      this.errMsg = ''
    },
    async saveNew() {
      if (!this.newName.trim()) return
      this.saving = true
      this.errMsg = ''
      try {
        await createPlushie(this.pendingId, this.newName.trim())
        this.router.push(`/ljubimac/${this.pendingId}`)
      } catch (e) {
        this.errMsg = e.message
      } finally {
        this.saving = false
      }
    },
  },
  beforeUnmount() {
    this.stopScan()
  },
}
</script>

<style scoped>
.err { color: red; }
</style>
