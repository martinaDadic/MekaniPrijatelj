<template>
    <div id="container">
        <header>
        <div class="wrapper">
            <h1>Moj profil</h1>
        </div>
        </header>
    </div>

    <div v-if="isAuthenticated && user">
    <p>Pozdrav {{ user.email }}</p>
    <button @click="logout">Logout</button>
    </div>
    <h1>Tvoji ljubimci: </h1>
      <div v-for="pet in myPets" :key="pet.id">
        <p>Ime: {{ pet.pet_name }}</p>
        <RouterLink :to="`/ljubimac/${pet.pet_id}`">Početna stranica</RouterLink>
    </div>

</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue'
import { RouterLink, RouterView } from 'vue-router'

const {
  isAuthenticated,
  logout: auth0Logout,
  user
} = useAuth0()

const logout = () =>
  auth0Logout({ logoutParams: { returnTo: window.location.origin } })

export default {
  setup() {
    const { isAuthenticated, getAccessTokenSilently} = useAuth0();
    return {isAuthenticated, getAccessTokenSilently};
  },
  data() {
    return {
      myPets: []
    };
  },
  async mounted() {
    if (this.isAuthenticated) {
      const token = await this.getAccessTokenSilently();
      const response = await fetch('https://mekaniprijatelj.onrender.com/api/my-pets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.myPets = await response.json();
    }
  }
}

</script>