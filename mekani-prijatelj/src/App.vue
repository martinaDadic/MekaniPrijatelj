<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="container">
    <header>

      <div class="wrapper">
        <h1>Mekani ljubimci</h1>

        <nav>
          <RouterLink to="/">Početna stranica</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>