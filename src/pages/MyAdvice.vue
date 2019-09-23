<template>
    <div class="madvice" style="width: 800px;margin: 0 auto">
      <van-tabs v-model="active" title-active-color="#26a2ff" title-inactive-color="#000000" color="#26a2ff" swipeable>
        <van-tab>
          <div slot="title" >
              <p style="line-height: 20px;padding-top: 10px">我的发布 <span style="font-weight: 500;font-size: 1.5rem">{{suggest.total}}</span></p>
          </div>
          <div id="mescrollSuggestDom">
            <mescroll-vue ref="mescrollSuggest" :down="suggest.mescrollDown" :up="suggest.mescrollUp" @init="mescrollInitSuggest">
              <Forum
                v-for="item in suggest.data"
                :sid="item.sid"
                :owner="item.owner"
                :files="item.files"
                :skimCount="item.skimCount"
                :shareCount="item.shareCount"
                :reviewCount="item.reviewCount"
                :likeCount="item.likeCount"
                :like="item.like"
                :essence="item.essence"
                :top="item.top"
                :content="item.content"
                :key="item.sid"
                :createTime="item.createTime"
                :moduleName="item.moduleName"
                :creator="item.creator"
                :title="item.title" ></Forum>
            </mescroll-vue>
          </div>
        </van-tab>
        <van-tab>
          <div slot="title" >
            <p style="line-height: 20px;padding-top: 10px">我的回复 <span style="font-weight: 500;font-size: 1.5rem">{{reply.total}}</span></p>
          </div>
          <div id="mescrollReplyDom">
            <mescroll-vue ref="mescrollReply" :down="reply.mescrollDown" :up="reply.mescrollUp" @init="mescrollInitReply">
              <ReplyForum
                v-for="item in reply.data"
                :createTime="item.createTime"
                :content="item.content"
                :type="2"
                :review="item.review"
                :reply="item.reply"
                :suggestion="item.suggestion"
              ></ReplyForum>
            </mescroll-vue>
          </div>
        </van-tab>
        <van-tab>
          <div slot="title" >
            <p style="line-height: 20px;padding-top: 10px">我的点赞 <span style="font-weight: 500;font-size: 1.5rem">{{like.total}}</span></p>
          </div>
          <div id="mescrollLikeDom">
            <mescroll-vue ref="mescrollLike" :down="like.mescrollDown" :up="like.mescrollUp" @init="mescrollInitLike">
              <ReplyForum
                :isLike="true"
                :type="1"
                :createTime="item.createTime"
                v-for="item in like.data"
                :review="item.review"
                :reply="item.reply"
                :suggestion="item.suggestion"
              ></ReplyForum>
            </mescroll-vue>
          </div>
        </van-tab>
        <van-tab>
          <div slot="title" >
            <p style="line-height: 20px;padding-top: 10px">我的版块 <span style="font-weight: 500;font-size: 1.5rem">{{module.total}}</span></p>
          </div>
          <div id="mescrollModuleDom">
            <mescroll-vue ref="mescrollModule" :down="module.mescrollDown" :up="module.mescrollUp" @init="mescrollInitModule">
              <ModuleListItem  v-for="it in module.data" :collectionCount="it.collectionCount" :suggestionCount="it.suggestionCount" :moduleName="it.moduleName" :moduleId="it.moduleId" :key="it.cId" :description="it.description" :icon="it.icon" :collect="it.collect">{{it.description}}</ModuleListItem>
            </mescroll-vue>
          </div>
        </van-tab>
      </van-tabs>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import ModuleListItem from './components/ModuleListItem'
import Forum from './components/Forum'
import ReplyForum from './components/ReplyForum'
import MescrollVue from 'mescroll.js/mescroll.vue'
import { Tab, Tabs } from 'vant'
export default {
  name: 'MyAdvice',
  data () {
    return {
      active: '',
      selected: '1',
      suggest: {
        mescroll: null,
        mescrollDown: {},
        mescrollUp: {
          callback: this.loadMoreSuggest,
          htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>',
          noMoreSize: 1,
          empty: {
            // 列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: 'mescrollSuggestDom', // 父布局的id (1.3.5版本支持传入dom元素)
            tip: '--我是有底线的--' // 提示
          }
        },
        url: 'suggest/mine',
        current: 1,
        data: [],
        total: '--'
      },
      reply: {
        mescroll: null,
        mescrollDown: {},
        mescrollUp: {
          callback: this.loadMoreReply,
          htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>',
          noMoreSize: 1,
          empty: {
            // 列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: 'mescrollReplyDom', // 父布局的id (1.3.5版本支持传入dom元素)
            tip: '--我是有底线的--' // 提示
          }
        },
        url: 'reply/mine',
        current: 1,
        data: [],
        total: '--'
      },
      like: {
        mescroll: null,
        mescrollDown: {},
        mescrollUp: {
          callback: this.loadMoreLike,
          htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>',
          noMoreSize: 1,
          empty: {
            // 列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: 'mescrollLikeDom', // 父布局的id (1.3.5版本支持传入dom元素)
            tip: '--我是有底线的--' // 提示
          }
        },
        url: 'like/mine',
        current: 1,
        data: [],
        total: '--'
      },
      module: {
        mescroll: null,
        mescrollDown: {},
        mescrollUp: {
          callback: this.loadMoreModule,
          htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>',
          noMoreSize: 1,
          empty: {
            // 列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: 'mescrollModuleDom', // 父布局的id (1.3.5版本支持传入dom元素)
            tip: '--我是有底线的--' // 提示
          }
        },
        url: 'module/mine',
        current: 1,
        data: [],
        total: '--'
      }
    }
  },
  computed: {
    ...mapState(['tabHeader'])
  },
  components: {Forum, ReplyForum, ModuleListItem, MescrollVue, VanTabs: Tabs, VanTab: Tab},
  // beforeRouteLeave (to, from, next) {
  //   // 设置下一个路由的 meta
  //   // from.meta.keepAlive = true
  //   this.$refs.mescrollSuggest && this.$refs.mescrollSuggest.beforeRouteLeave()
  //   this.$refs.mescrollReply && this.$refs.mescrollReply.beforeRouteLeave()
  //   this.$refs.mescrollLike && this.$refs.mescrollReply.beforeRouteLeave()
  //   this.$refs.mescrollModule && this.$refs.mescrollReply.beforeRouteLeave()
  //   // if (to.path != '/home') to.meta.keepAlive = false
  //   // B 跳转到 A 时，让 A 不缓存，即刷新（代码写在C页面）
  //   next()
  // },
  // beforeRouteEnter (to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteEnter不用写
  //   next(vm => {
  //     // 找到当前mescroll的ref,调用子组件mescroll-vue的beforeRouteEnter方法
  //     vm.$refs.mescrollSuggest && vm.$refs.mescrollSuggest.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
  //     vm.$refs.mescrollReply && vm.$refs.mescrollReply.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
  //     vm.$refs.mescrollLike && vm.$refs.mescrollLike.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
  //     vm.$refs.mescrollModule && vm.$refs.mescrollModule.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
  //   })
  // },
  created () {
    this.$store.state.headerZindex = 99
  },
  methods: {
    loadMoreSuggest (page, mescroll) {
      var type = 'suggest'
      var that = this
      this.requestData(this[type].url, page.num).then(res => {
        if (page.num === 1) that[type].data = []
        that.suggest.total = res.total
        that[type].data = [...that[type].data, ...res.records]
        this.$nextTick(() => {
          mescroll.endSuccess(res.records.length)
        })
      })
    },
    loadMoreReply (page, mescroll) {
      var type = 'reply'
      var that = this
      this.requestData(this[type].url, page.num).then(res => {
        if (page.num === 1) that[type].data = []
        that.reply.total = res.total
        that[type].data = [...that[type].data, ...res.records]
        this.$nextTick(() => {
          mescroll.endSuccess(res.records.length)
        })
      })
    },
    loadMoreLike (page, mescroll) {
      var type = 'like'
      var that = this
      this.requestData(this[type].url, page.num).then(res => {
        if (page.num === 1) that[type].data = []
        that.like.total = res.total
        that[type].data = [...that[type].data, ...res.records]
        this.$nextTick(() => {
          mescroll.endSuccess(res.records.length)
        })
      })
    },
    loadMoreModule (page, mescroll) {
      var type = 'module'
      var that = this
      this.requestData(this[type].url, page.num).then(res => {
        if (page.num === 1) that[type].data = []
        that.module.total = res.total
        that[type].data = [...that[type].data, ...res.records]
        this.$nextTick(() => {
          mescroll.endSuccess(res.records.length)
        })
      })
    },
    mescrollInitSuggest (mescroll) {
      this.suggest.mescroll = mescroll
    },
    mescrollInitReply (mescroll) {
      this.reply.mescroll = mescroll
    },
    mescrollInitLike (mescroll) {
      this.like.mescroll = mescroll
    },
    mescrollInitModule (mescroll) {
      this.module.mescroll = mescroll
    },
    loadMore (type) {
      var that = this
      this.requestData(this[type].url, this[type].current).then(res => {
        that[type].data = [...that[type].data, ...res.records]
        if (res.pages <= res.current) {
          that[type].isLoaded = true
        }
        that[type].current += 1
      })
    },
    requestData (url, current) {
      var that = this
      return new Promise(resolve => {
        this.$http({
          method: 'post',
          url: url,
          data: {
            uid: that.$store.state.loginUser,
            current: current,
            size: 10
          }
        }).then(res => {
          if (res.code === 200) {
            resolve(res.data)
          }
        })
      })
    }

  },
  mounted () {
    var that = this
    this.tabHeader.title = '我的'
    this.tabHeader.rightBtn = {
      url: '',
      title: ''
    }
    this.requestData('reply/mine', 1).then(res => {
      that.reply.total = res.total
    })
    this.requestData('like/mine', 1).then(res => {
      that.like.total = res.total
    })
    this.requestData('module/mine', 1).then(res => {
      that.module.total = res.total
    })
  }
}
</script>

<style scoped lang="scss">
  /deep/ .van-tabs--line { height:60px;}   /deep/ .van-tabs__wrap{height:60px;}
  .mescroll {
    position: fixed;
    top: 115px;
    bottom: 0;
    width: 800px;
    height: calc(100% - 115px);
  }
.madvice{
  height: calc(100% - 40px);
  position: relative;
  padding-top: 40px;
  .navbar{
    z-index: 9999;
    .navItem{
      p{
        padding-top: .2rem;
        font-size: 1.5rem;
      }
    }
  }
}
</style>
