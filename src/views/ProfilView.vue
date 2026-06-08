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
import { RouterLink } from 'vue-router'

export default {
  setup() {
    // SVE iz Auth0 mora biti unutar setup()
    const { isAuthenticated, getAccessTokenSilently, user, logout: auth0Logout } = useAuth0();
    
    const logout = () =>
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });

    return { isAuthenticated, getAccessTokenSilently, user, logout };
  },
  data() {
    return {
      myPets: []
    };
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