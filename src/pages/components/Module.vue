<template>
    <div id="modapp" @click="toModule">
        <img :src="icon" />
        <p style="text-align: center;margin: 0 auto;width: 50px">{{moduleName}}</p>
<!--        <div class="maru"></div>-->
    </div>
</template>

<script>
export default {
  name: 'Module',
  props: ['id', 'cid', 'icon', 'moduleName', 'details'],
  methods: {
    toModule () {
      // eslint-disable-next-line standard/object-curly-even-spacing
      this.$router.push({ path: 'module', query: { moduleId: this.id }})
    }
  }
}
</script>

<style scoped lang="scss">
#modapp{
  display: inline-block;
  position: relative;
  text-align: center;
  margin: 0 10px;
  img{
    width: 36px;
    height: 36px;
    border-radius: 38rem;
  }
  p{
    text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;
    /*-webkit-line-clamp:1;*/
  }
  .maru{
    position: absolute;
    width: .5rem;
    height: .5rem;
    border-radius: .5rem;
    background: red;
    right: 0;
    top: 0;
  }
}
</style>
