<template>
  <div class="page">
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <p>Učitavam ljubimca...</p>
    </div>

    <div v-else-if="!found" class="card not-found">
      <h3>Ljubimac nije pronađen</h3>
    </div>

    <div v-else class="card happiness-card">
      <h3>Sreća</h3>
      <img
        :src="`/images/healthBar${happiness}.png`"
        class="happiness-bar"
        :alt="`Sreća: ${happiness}/3`"
      />
      <p>{{ happiness }}/3</p>
    </div>
  </div>
</template>

<script>
import { getPlushieName, getPlushieHappiness } from "../homeAssistant.js";

export default {
  data() {
    return {
      loading: true,
      found: false,
      happiness: 3,
    };
  },
  mounted() {
    this.loadPlushie();
  },
  methods: {
    async loadPlushie() {
      this.loading = true;
      const [name, happiness] = await Promise.all([
        getPlushieName(),
        getPlushieHappiness(),
      ]);
      if (name !== null) {
        this.found = true;
        this.happiness = happiness ?? 3;
      } else {
        this.found = false;
      }
      this.loading = false;
    },
  },
};
</script>