<template>
    <h1> Ljubimac {{ imeLjubimca }} </h1>
    <p>pozdrav bando, mazite me!!</p>
    <img src="/images/medo.png" width="10%" />
    <img :src="`/images/healthBar${health}.png`" />
    <br>
    <button @click="decreaseHealth">-1</button>
    <button @click="increaseHealth">+1</button>
    <br>
    <button @click="pricaj">pricaj!</button>
    <button v-if="isAuthenticated && !myPets.some(pet => pet.pet_id === $route.params.id)" @click="addPet">Dodaj ljubimca!</button>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  data() {
    return {
      health: 10,
      imeLjubimca: 'Pero',
      myPets: []
    }
  },
  setup() {
    const { isAuthenticated, getAccessTokenSilently} = useAuth0();
    return {isAuthenticated, getAccessTokenSilently};
  },
  methods: {
    decreaseHealth() {
      if (this.health > 0) this.health--;
    },
    increaseHealth() {
      if (this.health < 10) this.health++;
    },
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
  }
}
</script>