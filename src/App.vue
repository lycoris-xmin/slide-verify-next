<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>

    <sliderVerify :imgs="imgs" :block="{ x: 189, y: 61 }"></sliderVerify>
  </div>
</template>
<script setup>
  import sliderVerify from '@/components/slider-verify/slider-verify.vue'

  import img0 from './assets/img.jpg'
  import img1 from './assets/img1.jpg'
  import img2 from './assets/img2.jpg'
  import img3 from './assets/img3.jpg'
  import img4 from './assets/img4.jpg'
  import img5 from './assets/img5.jpg'

  const imgs = [img0, img1, img2, img3, img4, img5]
</script>
<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
