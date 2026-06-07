<template>
  <div class="page">
    <div class="surface">
      <p class="section-label">QR code generator</p>

      <label class="field-label">Plushie ID</label>
      <div class="row">
        <input v-model="plushieId" class="input-field" placeholder="e.g. bear_001" @input="generate" />
        <button class="btn btn-primary" @click="generate">Generate</button>
      </div>

      <p class="hint">QR encodes the value <code>plushie:&lt;id&gt;</code></p>
    </div>

    <div v-if="qrDataUrl" class="surface qr-result">
      <div class="qr-wrap">
        <img :src="qrDataUrl" class="qr-img" :alt="`QR for ${plushieId}`" />
      </div>
      <p class="qr-label">plushie:<strong>{{ plushieId }}</strong></p>
      <button class="btn btn-ghost download-btn" @click="download">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PNG
      </button>
    </div>

    <div class="surface instructions">
      <p class="section-label">printing guide</p>
      <ol class="guide">
        <li>Enter each plushie's ID above and download the QR code.</li>
        <li>Print at 3×3 cm or larger for reliable scanning.</li>
        <li>Laminate or use a clear sticker sheet over the print so it survives washing.</li>
        <li>Attach to the plushie's tag or sew a small pocket on the back.</li>
        <li>Scan with the main app — the ID is read automatically.</li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      plushieId: '',
      qrDataUrl: '',
    }
  },
  methods: {
    generate() {
      if (!this.plushieId.trim()) { this.qrDataUrl = ''; return }
      const value = `plushie:${this.plushieId.trim()}`

      if (typeof QRCode !== 'undefined') {
        const canvas = document.createElement('canvas')
        QRCode.toCanvas(canvas, value, { width: 300, margin: 2 }, (err) => {
          if (!err) this.qrDataUrl = canvas.toDataURL()
        })
      } else {
        this.qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(value)}`
      }
    },
    download() {
      const a = document.createElement('a')
      a.href = this.qrDataUrl
      a.download = `qr_${this.plushieId}.png`
      a.click()
    },
  },
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.surface { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; }
.section-label {
  font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px;
}
.field-label { display: block; font-size: 0.75rem; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
.row { display: flex; gap: 8px; }
.row .input-field { flex: 1; }
.hint { margin-top: 8px; font-size: 0.78rem; color: var(--text-muted); }
.hint code { font-family: 'DM Mono', monospace; }

.qr-result { text-align: center; }
.qr-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
.qr-img { width: 200px; height: 200px; image-rendering: pixelated; border: 1px solid var(--border); border-radius: 6px; }
.qr-label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; }
.qr-label strong { color: var(--text); }
.download-btn { margin: 0 auto; }

.instructions {}
.guide {
  list-style: decimal;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.guide li { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
</style>
