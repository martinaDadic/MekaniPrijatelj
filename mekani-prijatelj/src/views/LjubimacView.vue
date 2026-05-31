<template>
    <h1> Ljubimac Mirko </h1>
    <p>pozdrav bando, mazite me!!</p>
    <img src="`/images/medo.png`" width=10%/>
    <img :src="`/images/healthBar${health}.png`"/>
    <br>
    <button @click="decreaseHealth">-1</button>
    <button @click="increaseHealth">+1</button>
    <br>
    <button @click="pricaj">pricaj!</button>
</template>

<script>
export default {
  data() {
    return {
      health: 10 
    }
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
    }
  }
}
</script>