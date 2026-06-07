<template>
  <div class="page">

    <div v-if="loading" class="loading">
      <span class="spinner"></span>
    </div>

    <template v-else-if="!found">
      <div class="surface">
        <p class="not-found-msg">No plushie with ID <code>{{ id }}</code> found.</p>
        <RouterLink to="/" class="btn btn-ghost" style="margin-top:14px;display:inline-flex;">← Back</RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="surface">
        <div class="id-row">
          <span class="plushie-id">{{ id }}</span>
          <RouterLink to="/" class="btn btn-ghost btn-sm">← Back</RouterLink>
        </div>

        <div class="name-block">
          <div v-if="!editingName" class="name-display">
            <h1 class="name">{{ plushie.name }}</h1>
            <button class="icon-btn" title="Rename" @click="startEdit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          <div v-else class="name-edit">
            <input
              ref="nameInput"
              v-model="tempName"
              class="input-field name-input"
              maxlength="32"
              @keyup.enter="saveName"
              @keyup.escape="editingName = false"
            />
            <button class="btn btn-primary btn-sm" :disabled="!tempName.trim()" @click="saveName">Save</button>
            <button class="btn btn-ghost btn-sm" @click="editingName = false">Cancel</button>
          </div>
          <p v-if="nameStatus" class="status" :class="nameStatus.ok ? 'ok' : 'fail'">
            {{ nameStatus.msg }}
          </p>
        </div>
      </div>

      <div class="surface">
        <p class="section-label">happiness</p>

        <div class="happiness-display">
          <span
            v-for="level in [0,1,2,3]"
            :key="level"
            class="pip"
            :class="{ filled: level <= plushie.happiness }"
          ></span>
        </div>

        <p class="happiness-label" :class="happinessClass">
          {{ happinessLabel }}
        </p>

        <div class="happiness-controls">
          <button
            class="btn btn-ghost"
            :disabled="plushie.happiness <= 0 || saving"
            @click="adjustHappiness(-1)"
          >−</button>
          <button
            class="btn btn-primary"
            :disabled="plushie.happiness >= 3 || saving"
            @click="adjustHappiness(1)"
          >+</button>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { getPlushie, updatePlushie } from '../homeAssistant.js'

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
      nameStatus: null,
      saving: false,
    }
  },
  computed: {
    happinessClass() {
      const h = this.plushie?.happiness ?? 0
      if (h >= 3) return 'happy'
      if (h >= 2) return 'mid'
      if (h >= 1) return 'low'
      return 'sad'
    },
    happinessLabel() {
      const labels = ['unhappy', 'okay', 'good', 'happy']
      return labels[this.plushie?.happiness ?? 0]
    }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      const p = await getPlushie(this.id)
      if (p) {
        this.found = true
        this.plushie = { ...p }
      } else {
        this.found = false
      }
      this.loading = false
    },
    startEdit() {
      this.tempName = this.plushie.name
      this.editingName = true
      this.nameStatus = null
      this.$nextTick(() => this.$refs.nameInput?.focus())
    },
    async saveName() {
      if (!this.tempName.trim()) return
      try {
        await updatePlushie(this.id, { name: this.tempName.trim() })
        this.plushie.name = this.tempName.trim()
        this.nameStatus = { ok: true, msg: 'Saved' }
      } catch (e) {
        this.nameStatus = { ok: false, msg: e.message }
      }
      this.editingName = false
      setTimeout(() => { this.nameStatus = null }, 2500)
    },
    async adjustHappiness(delta) {
      const next = Math.min(3, Math.max(0, this.plushie.happiness + delta))
      this.saving = true
      try {
        await updatePlushie(this.id, { happiness: next })
        this.plushie.happiness = next
      } catch {}
      this.saving = false
    },
  },
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.spinner {
  display: inline-block;
  width: 24px; height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.surface {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
}

.section-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.plushie-id {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-muted);
}
.btn-sm { font-size: 0.8rem; padding: 6px 12px; }

.name-block {}
.name-display {
  display: flex;
  align-items: center;
  gap: 10px;
}
.name {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}
.icon-btn:hover { color: var(--text); background: var(--surface-2); }

.name-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}
.name-input { flex: 1; }

.status {
  font-size: 0.78rem;
  margin-top: 6px;
}
.status.ok { color: var(--happy); }
.status.fail { color: var(--sad); }

.happiness-display {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.pip {
  width: 28px;
  height: 10px;
  border-radius: 99px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: background 0.2s, border-color 0.2s;
}
.pip.filled {
  background: var(--accent);
  border-color: var(--accent);
}

.happiness-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 14px;
}
.happiness-label.happy { color: var(--happy); }
.happiness-label.mid   { color: var(--mid); }
.happiness-label.low   { color: var(--mid); }
.happiness-label.sad   { color: var(--sad); }

.happiness-controls {
  display: flex;
  gap: 8px;
}

.not-found-msg {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.not-found-msg code {
  font-family: 'DM Mono', monospace;
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text);
}
</style>
