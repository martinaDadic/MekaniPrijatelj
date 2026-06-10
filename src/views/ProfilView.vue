<template>
  <div class="max-w-3xl mx-auto">
    <header class="mb-8 border-b border-pink-200 pb-4">
      <h1 class="text-3xl font-bold text-pink-600">Moj profil</h1>
    </header>

    <div v-if="isAuthenticated && user" class="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-100 flex justify-between items-center">
      <p class="text-lg text-slate-700 font-medium">Pozdrav, <span class="text-pink-500">{{ user.email }}</span>!</p>
    </div>

    <h2 class="text-2xl font-bold text-slate-700 mb-6">Tvoji ljubimci: </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div 
        v-for="pet in myPets" 
        :key="pet.id" 
        class="bg-white p-5 rounded-2xl shadow hover:shadow-md transition-shadow border border-pink-50 flex flex-col justify-between"
      >
        <p class="text-xl font-bold text-slate-800 mb-3">{{ pet.pet_name }}</p>
        <RouterLink 
          :to="`/ljubimac/${pet.pet_id}`" 
          class="inline-block text-center bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-medium hover:bg-pink-200 transition-colors mt-auto"
        >
          Pogledaj stanje
        </RouterLink>
      </div>
    </div>
    
    <div v-if="myPets.length === 0" class="text-center py-10 bg-white rounded-2xl border border-dashed border-pink-200">
      <p class="text-slate-500">Trenutno nemaš dodanih ljubimaca.</p>
    </div>
  </div>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue'
import { RouterLink } from 'vue-router'

export default {
  setup() {
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
