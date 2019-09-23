<template>
    <div class="item">
      <img @click="toDetail" :src="icon" />
      <div @click="toDetail" class="cont">
        <h4>{{moduleName}}</h4>
        <p v-if="type">{{description}}</p>
        <p v-if="!type">收藏数：{{collectionCount}} 帖子数：{{suggestionCount}}</p>
      </div>
      <mt-button v-if="type" @click="collectIt(collect)" :type="!collect?'primary':''" class="btn">{{collect?"取消收藏":"收藏"}}</mt-button>
    </div>
</template>

<script>
export default {
  name: 'ModuleListItem',
  props: ['moduleName', 'moduleId', 'description', 'icon', 'collect', 'type', 'collectionCount', 'suggestionCount', 'idx', 'idxx'],
  methods: {
    collectIt (isCollected) {
      var that = this
      var type = isCollected ? 'cancel' : 'add'
      this.$http({
        method: 'post',
        url: 'module/collect/' + type,
        data: {
          uid: that.$store.state.loginUser,
          moduleId: that.moduleId
        }
      }).then(res => {
        if (res.code === 200) {
          that.collect = !that.collect
          that.$emit('changeCollect', this.idxx, this.idx)
          that.$store.state.indexCollectChange += 1
        } else {}
      })
    },
    toDetail () {
      this.$router.push({path: './module', query: {moduleId: this.moduleId}})
    }
  }
}
</script>

<style scoped lang="scss">
.item{
  padding: .6rem .5rem;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  margin-bottom: .3rem;
  border-bottom: 1px solid $borderColor;
  img{
    width: 4rem;
    height: 4rem;
    border-radius: 4rem;
  }
  .cont{
    position: relative;
    top: .5rem;
    flex: 5;
    line-height: 1.5rem;
    margin-left: .5rem;
    p{
      color: $fontColorSub;
      font-size: $fontSizeSub;
    }
  }
  .btn{
    width: 5rem;
    position: relative;
    top:1.2rem;
    height: 1.5rem;
    font-size: $fontSizeSub;
    margin-right: .4rem;
  }
}
</style>
