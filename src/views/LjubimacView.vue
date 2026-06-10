<template>
  <div>
    <div v-if="loading">
      <p>Učitavanje...</p>
    </div>
    <div v-else-if="!found">
      <p>Ljubimac nije pronađen.</p>
    </div>
    <div v-else>
      <h1>Ljubimac {{ name }}</h1>
      <p>pozdrav bando, mazite me!!</p>
      <img src="/images/medo.png" width="10%" />
      <img :src="`/images/healthBar${happiness}.png`" />
      <br />
      <div v-if="editingName">
        <input v-model="newName" />
        <button @click="saveName">Spremi</button>
        <button @click="editingName = false">Odustani</button>
      </div>
      <div v-else>
        <button @click="startEditName">Promijeni ime</button>
      </div>
      <button @click="pricaj">Reci trenutno stanje sreće!</button>
      <button
        v-if="isAuthenticated && !myPets.some(pet => pet.pet_id === $route.params.id)"
        @click="addPet"
      >
        Dodaj ljubimca!
      </button>
    </div>
  </div>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';
import { getPlushieName, getPlushieHappiness, playSound, setPlushieName } from '../homeAssistant.js';

export default {
  setup() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    return { isAuthenticated, getAccessTokenSilently };
  },
  data() {
    return {
      loading: true,
      found: false,
      name: '',
      happiness: 3,
      myPets: [],
      editingName: false,
      newName: '',
    };
  },
  async mounted() {
    await this.loadPlushie();
    if (this.isAuthenticated) {
      await this.loadMyPets();
    }
  },
  methods: {
    async loadPlushie() {
      this.loading = true;
      try {
        const [name, happiness] = await Promise.all([
          getPlushieName(),
          getPlushieHappiness(),
        ]);
        if (name !== null) {
          this.found = true;
          this.name = name;
          this.happiness = happiness ?? 3;
        } else {
          this.found = false;
        }
      } catch (err) {
        console.error('Greška pri dohvaćanju ljubimca:', err);
        this.found = false;
      } finally {
        this.loading = false;
      }
    },
    startEditName() {
      this.newName = this.name;
      this.editingName = true;
    },
    async saveName() {
      if (!this.newName.trim()) return;
      await setPlushieName(this.newName.trim());
      this.name = this.newName.trim();
      this.editingName = false;
    },
    async loadMyPets() {
      try {
        const token = await this.getAccessTokenSilently();
        const response = await fetch('https://mekaniprijateljweb.onrender.com/api/my-pets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.myPets = await response.json();
      } catch (err) {
        console.error('Greška pri dohvaćanju ljubimaca:', err);
      }
    },
    async pricaj() {
      await playSound(this.happiness);
    },
    async addPet() {
      try {
        const token = await this.getAccessTokenSilently();
        const response = await fetch('https://mekaniprijateljweb.onrender.com/api/add-pet', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pet_id: this.$route.params.id, pet_name: this.name }),
        });
        if (response.ok) {
          const added = await response.json();
          this.myPets.push(added);
        }
      } catch (err) {
        console.error('Greška pri dodavanju ljubimca:', err);
      }
    },
  },
};
</script>