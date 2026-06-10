<template>
  <div class="min-h-screen bg-pink-50 text-slate-700 font-sans">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold text-pink-600 tracking-tight">Mekani ljubimci</h1>
        <nav class="flex items-center space-x-4">
          <RouterLink class="text-slate-600 hover:text-pink-500 font-medium transition-colors" to="/">Početna</RouterLink>
          <div v-if="isAuthenticated && user" class="flex items-center space-x-4">
            <RouterLink class="text-slate-600 hover:text-pink-500 font-medium transition-colors" to="/profil">Moj profil</RouterLink>
            <button class="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-medium hover:bg-pink-200 transition-colors" @click="logout">Logout</button>
          </div>
          <div v-else class="flex items-center space-x-3">
            <p v-if="error" class="text-red-500 text-sm">Error: {{ error.message }}</p>
            <button class="text-pink-600 hover:text-pink-700 font-medium" @click="signup">Signup</button>
            <button class="bg-pink-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-pink-600 transition-colors" @click="login">Login</button>
          </div>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { RouterLink, RouterView } from 'vue-router'

const {
  isAuthenticated,
  error,
  loginWithRedirect,
  logout: auth0Logout,
  user
} = useAuth0()

const signup = () =>
  loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })

const login = () => loginWithRedirect()

const logout = () =>
  auth0Logout({ logoutParams: { returnTo: window.location.origin } })
</script>

<style scoped>
/* Scoped styles removed in favor of Tailwind utility classes */
</style>
