<template>
  <div>
    <nav>
      <RouterLink to="/">Početna</RouterLink> |
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>