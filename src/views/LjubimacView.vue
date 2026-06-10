<template>
  <div class="max-w-2xl mx-auto py-8 text-center bg-white p-8 rounded-3xl shadow-lg border border-pink-50">
    <div v-if="loading" class="animate-pulse flex flex-col items-center space-y-4">
      <div class="w-32 h-32 bg-pink-100 rounded-full"></div>
      <div class="h-8 bg-pink-100 rounded w-1/2"></div>
      <div class="h-4 bg-slate-100 rounded w-1/3"></div>
    </div>
    <div v-else-if="!found" class="py-12">
      <p class="text-xl text-slate-500">Ljubimac nije pronađen.</p>
    </div>
    <div v-else class="flex flex-col items-center">
      <h1 class="text-4xl font-extrabold text-pink-500 mb-2">Ljubimac {{ name }}</h1>
      <p class="text-slate-600 mb-6 italic">"Pozdrav bando, mazite me!!"</p>
      
      <div class="relative inline-block mb-8 group">
        <div class="absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <img src="/images/medo.png" class="w-48 h-48 object-contain relative mx-auto drop-shadow-xl transform hover:scale-105 transition-transform duration-300" alt="Medo" />
      </div>
      
      <div class="mb-8 w-full max-w-xs mx-auto bg-slate-50 p-4 rounded-2xl shadow-inner">
        <p class="text-sm font-semibold text-slate-500 uppercase mb-2">Sreća</p>
        <img :src="`/images/healthBar${happiness}.png`" class="w-full h-auto object-contain" alt="Stanje sreće" />
      </div>
      
      <div v-if="editingName" class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6 bg-pink-50 p-4 rounded-xl w-full max-w-md">
        <input 
          v-model="newName" 
          class="flex-1 px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="Unesite novo ime..."
        />
        <div class="flex space-x-2">
          <button @click="saveName" class="bg-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-pink-600 transition-colors shadow-sm">Spremi</button>
          <button @click="editingName = false" class="bg-white text-slate-600 px-4 py-2 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Odustani</button>
        </div>
      </div>
      <div v-else class="mb-6">
        <button @click="startEditName" class="text-sm text-pink-600 hover:text-pink-700 underline font-medium underline-offset-4">Promijeni ime</button>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button 
          @click="pricaj"
          class="flex-1 max-w-xs bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          Reci trenutno stanje sreće!
        </button>
        <button
          v-if="isAuthenticated && !myPets.some(pet => pet.pet_id === $route.params.id)"
          @click="addPet"
          class="flex-1 max-w-xs bg-white text-pink-600 border-2 border-pink-400 py-3 px-6 rounded-2xl font-bold hover:bg-pink-50 transition-colors shadow-sm"
        >
          Dodaj ljubimca!
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import { useAuth0 } from '@auth0/auth0-vue';
import {
  getPlushieName,
  getPlushieHappiness,
  playSound,
  setPlushieName,
  activatePlushie
} from '../homeAssistant.js';

export default {

  setup() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    return {
      isAuthenticated,
      getAccessTokenSilently
    };
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

    if (this.$route.path.endsWith('/activate')) {
      await activatePlushie();

      this.$router.replace(`/ljubimac/${this.$route.params.id}`);
    }

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

        console.error(
          'Greška pri dohvaćanju ljubimca:',
          err
        );

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

      await setPlushieName(
        this.newName.trim()
      );

      this.name = this.newName.trim();
      this.editingName = false;

    },


    async loadMyPets() {

      try {

        const token = await this.getAccessTokenSilently();

        const response = await fetch(
          'https://mekaniprijateljweb.onrender.com/api/my-pets',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.myPets = await response.json();


      } catch (err) {

        console.error(
          'Greška pri dohvaćanju ljubimaca:',
          err
        );

      }
    },


    async pricaj() {
      await playSound(this.happiness);
    },


    async addPet() {

      try {

        const token = await this.getAccessTokenSilently();


        const response = await fetch(
          'https://mekaniprijateljweb.onrender.com/api/add-pet',
          {
            method: 'POST',

            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              pet_id: this.$route.params.id,
              pet_name: this.name
            }),
          }
        );


        if (response.ok) {

          const added = await response.json();

          this.myPets.push(added);

        }


      } catch (err) {

        console.error(
          'Greška pri dodavanju ljubimca:',
          err
        );

      }
    },
  },
};
</script>
