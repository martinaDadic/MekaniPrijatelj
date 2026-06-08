<template>
<div id="container">
    <header>

      <div class="wrapper">
        <h1>Mekani ljubimci</h1>
      </div>
    </header>

  </div>

  <div v-if="isAuthenticated && user">
    <p>Logged in as {{ user.email }}</p>
    <RouterLink to="/profil">Moj profil</RouterLink>

    <button @click="logout">Logout</button>
  </div>

  <div v-else>
    <p v-if="error">Error: {{ error.message }}</p>

    <button @click="signup">Signup</button>

    <button @click="login">Login</button>
  </div>
  <nav>
          <RouterLink to="/">Početna stranica</RouterLink>
  </nav>
  <RouterView />
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

const login = () => loginWithRedirect({
  authorizationParams: {
    audience: 'https://mekaniprijatelj-api'
  }
})

const signup = () => loginWithRedirect({
  authorizationParams: {
    screen_hint: 'signup',
    audience: 'https://mekaniprijatelj-api' // Dodaj i ovdje za svaki slučaj!
  }
})

const logout = () =>
  auth0Logout({ logoutParams: { returnTo: window.location.origin } })
</script>