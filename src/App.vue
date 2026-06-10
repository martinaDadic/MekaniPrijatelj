<template>
<div id="container">
  <header>
    <h1>Mekani ljubimci</h1>
    <div id="nav">
      <RouterLink to="/">Početna stranica</RouterLink>
      <div v-if="isAuthenticated && user">
        <RouterLink to="/profil">Moj profil</RouterLink>

        <button @click="logout">Logout</button>
      </div>

      <div v-else>
        <p v-if="error">Error: {{ error.message }}</p>

        <button @click="signup">Signup</button>

        <button @click="login">Login</button>
      </div>
    </div>
  </header>
  <RouterView />
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
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }
  #nav{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px;
  }
</style>