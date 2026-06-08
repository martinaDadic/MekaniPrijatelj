<template>
    <h1> Ljubimac {{ name }} </h1>
    <p>pozdrav bando, mazite me!!</p>
    <img src="/images/medo.png" width="10%" />
    <img :src="`/images/healthBar${happiness}.png`" />
    <br>
    <button @click="pricaj">pricaj!</button>
    <button v-if="isAuthenticated && !myPets.some(pet => pet.pet_id === $route.params.id)" @click="addPet">Dodaj ljubimca!</button>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';
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