<template>
  <div class="page">

    <section class="scan-section">
      <div v-if="!scanning && !pendingNew" class="idle-state">
        <p class="section-label">scan plushie</p>
        <button class="scan-btn" @click="startScan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h3v3M17 20h3v-3M20 14v3"/>
          </svg>
          Scan QR code
        </button>

        <div class="divider"><span>or enter ID</span></div>

        <div class="manual-row">
          <input
            v-model="manualId"
            class="input-field"
            placeholder="plushie ID"
            @keyup.enter="loadManual"
          />
          <button class="btn btn-ghost" @click="loadManual">Go</button>
        </div>

        <p v-if="errMsg" class="err-msg">{{ errMsg }}</p>
      </div>

      <div v-if="scanning" class="scanner-wrap">
        <video ref="videoEl" autoplay playsinline class="scanner-video"></video>
        <div class="viewfinder">
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
        </div>
        <p class="scan-hint">{{ scanMsg }}</p>
        <button class="btn btn-ghost mt12" @click="stopScan">Cancel</button>
      </div>
    </section>

    <section v-if="pendingNew" class="new-form">
      <p class="section-label">new plushie</p>
      <p class="new-id">ID: <code>{{ pendingId }}</code></p>
      <label class="field-label">Name</label>
      <input
        v-model="newName"
        class="input-field"
        placeholder="Give it a name…"
        maxlength="32"
        autofocus
        @keyup.enter="saveNew"
      />
      <div class="form-actions">
        <button class="btn btn-ghost" @click="cancelNew">Back</button>
        <button class="btn btn-primary" :disabled="!newName.trim() || saving" @click="saveNew">
          {{ saving ? 'Saving…' : 'Create' }}
        </button>
      </div>
      <p v-if="errMsg" class="err-msg">{{ errMsg }}</p>
    </section>

  </div>
</template>

<script>
import { createPlushie, getPlushie } from '../homeAssistant.js'
import { useRouter } from 'vue-router'

export default {
  setup() { return { router: useRouter() } },
  data() {
    return {
      scanning: false,
      manualId: '',
      pendingNew: false,
      pendingId: '',
      newName: '',
      saving: false,
      errMsg: '',
      scanMsg: 'Point camera at QR code',
      stream: null,
      scanInterval: null,
    }
  },
  methods: {
    async startScan() {
      this.errMsg = ''
      this.scanning = true
      this.scanMsg = 'Point camera at QR code'
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        await this.$nextTick()
        this.$refs.videoEl.srcObject = this.stream

        if (!('BarcodeDetector' in window)) {
          this.scanMsg = 'BarcodeDetector not supported — use manual ID'
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
        this.scanMsg = 'Camera error: ' + e.message
      }
    },
    stopScan() {
      clearInterval(this.scanInterval)
      if (this.stream) this.stream.getTracks().forEach(t => t.stop())
      this.scanning = false
      this.scanMsg = ''
      this.stream = null
    },
    handleScanned(raw) {
      this.stopScan()
      const id = raw.startsWith('plushie:') ? raw.slice(8) : raw
      this.load(id.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
    },
    loadManual() {
      if (!this.manualId.trim()) return
      const id = this.manualId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      this.load(id)
    },
    async load(id) {
      this.errMsg = ''
      try {
        const existing = await getPlushie(id)
        if (existing) {
          this.router.push(`/ljubimac/${id}`)
        } else {
          this.pendingId = id
          this.pendingNew = true
          this.newName = ''
        }
      } catch (e) {
        this.errMsg = 'Connection error: ' + e.message
      }
    },
    cancelNew() {
      this.pendingNew = false
      this.pendingId = ''
      this.newName = ''
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
  beforeUnmount() { this.stopScan() },
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }

.section-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.scan-section, .new-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.idle-state { display: flex; flex-direction: column; }

.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid #e8c9ae;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
}
.scan-btn:hover { background: #f0daca; }

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.manual-row { display: flex; gap: 8px; }
.manual-row .input-field { flex: 1; }

.scanner-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
.scanner-video { width: 100%; border-radius: 8px; display: block; }
.viewfinder {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 180px; height: 180px;
}
.corner {
  position: absolute;
  width: 20px; height: 20px;
  border-color: var(--accent);
  border-style: solid;
}
.corner.tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
.corner.tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
.corner.bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
.corner.br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

.scan-hint {
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}
.mt12 { margin-top: 12px; }

.new-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.new-id code {
  font-family: 'DM Mono', monospace;
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text);
}
.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 14px;
}

.err-msg {
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--sad);
}
</style>
