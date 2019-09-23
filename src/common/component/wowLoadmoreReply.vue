<template>
  <div class="outer" id="loadMoreReply" :style="{height:height+'px', width:width+'px'}">
    <!--      <div v-if="refreshVisible" class="loading"><span><i class="el-icon-loading"></i>刷新中</span></div>-->
    <slot id="content"></slot>
    <div v-if="!isLoaded" class="loading loadBottom"><span><i class="el-icon-loading"></i>加载中</span></div>
    <div v-else :style="{textAlign: 'center',padding:'15px',color:'gray'}">--我是有底线的--</div>
  </div>
</template>

<script>
export default {
  name: 'wowLoadmore',
  data () {
    return {
      refreshVisible: false
    }
  },
  props: {
    height: {
      type: [Number, String],
      default: '100%'
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    refresh: {
    },
    isLoaded: {}
  },
  mounted () {
    var that = this
    var t = null
    document.getElementById('loadMoreReply').addEventListener('scroll', function (e) {
      if (t === true) return
      t = true
      setTimeout(() => {
        if (document.getElementById('loadMoreReply').scrollHeight - e.target.scrollTop <= that.height) {
          that.$emit('loadMore')
        }
        t = false
      }, 500)
    })
  }
}
</script>

<style scoped lang="scss">
  .outer{
    overflow: auto;
    .loading{
      color: #26a2ff;
      margin: 0 auto;
      text-align: center;
      padding: 20px 0;
      span{
        margin: 0 auto;
      }
    }
  }

</style>
