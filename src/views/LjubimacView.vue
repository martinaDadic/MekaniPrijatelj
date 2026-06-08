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
    <button v-if="isAuthenticated" @click="addPet">Dodaj ljubimca!</button>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  data() {
    return {
      health: 10,
      imeLjubimca: 'Pero'
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
      try {
        const token = await this.getAccessTokenSilently();
        const petId = this.$route.params.id;

        const response = await fetch('https://mekaniprijatelj.onrender.com/api/add-pet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ pet_id: petId, pet_name: this.imeLjubimca })
        });

        if (response.ok) {
          alert('Uspješno dodan ljubimac!');
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
}
</script>