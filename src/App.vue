<template>
  <div id="app" style="height: 100%">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted () {
  }
}
</script>

<style lang="scss">
  html,body,div,h1,h2,h3,h4,h5,p,ul,ol,li,table,thead,tbody,tfoot,tt,td,tr,th,dl,dd,dt{
    margin: 0;
    padding: 0;
  }
  html{
    font-size: 16px;
  }
  body{
    background-color: $bgColor;
    height: 100%;
  }
  .clicker:hover{
    background-color: #cacaca;
  }
  /*::-webkit-scrollbar {*/
  /*  display: none;*/
  /*}*/
</style>
