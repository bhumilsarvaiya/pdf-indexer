<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view/>
    <f-footer></f-footer>
  </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import Footer from '@/components/Footer'
export default {
  name: 'App',
  components:{
    'f-footer': Footer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
