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
import {
  getPlushieName,
  getPlushieHappiness,
  setPlushieName,
} from "../homeAssistant.js";

export default {
  data() {
    return {
      imeLjubimca: 'Pero',
      myPets: [],
      loading: true,
      found: false,
      name: "",
      happiness: 3,
      editingName: false,
      tempName: "",
      nameStatus: null,
    }
  },
  setup() {
    const { isAuthenticated, getAccessTokenSilently} = useAuth0();
    return {isAuthenticated, getAccessTokenSilently};
  },
  methods: {
    pricaj(){
        alert("YO!");
    },
    async addPet(){
      if (!this.myPets.some(pet => pet.pet_id === this.$route.params.id)) {
        try {
          const token = await this.getAccessTokenSilently();
          const petId = this.$route.params.id;

          const response = await fetch('https://mekaniprijateljweb.onrender.com/api/add-pet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ pet_id: petId, pet_name: this.imeLjubimca })
          });

          if (response.ok) {
            alert('Uspješno dodan ljubimac!');
            this.myPets.push({
                pet_id: petId,
                pet_name: this.imeLjubimca
            });
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }else{
        alert("Ovaj ljubimac je već dodan!");
      }
    },
    async loadPlushie() {
      this.loading = true;
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
      this.loading = false;
    }
  },
  async mounted() {
    if (this.isAuthenticated) {
      try {
        const token = await this.getAccessTokenSilently();
        const response = await fetch('https://mekaniprijateljweb.onrender.com/api/my-pets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.myPets = await response.json();
      } catch (error) {
        console.error("Greška pri dohvaćanju ljubimaca:", error);
      }
    }
    this.loadPlushie();
  }
}
</script>