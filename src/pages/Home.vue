<template>
  <div class="homeApp" style="margin: 0 auto;width: 800px">
    <mt-navbar v-model="moduleSelected" style="box-sizing: border-box;padding-top: 38px">
      <mt-tab-item class="head-color" id="myColllect">我的收藏</mt-tab-item>
      <div style="width: 80%"></div>
      <mt-button @click="toAllModule" style="font-size: 10px;height: 1.6rem;width: 4.5rem;position: relative;top: .7rem;margin-right: .5rem;box-sizing: border-box">全部版块</mt-button>
    </mt-navbar>
    <mt-tab-container v-model="moduleSelected">
      <mt-tab-container-item id="myColllect">
        <div class="module">
          <p v-if="collectList.length==0" style="text-align: center;width: 100%;;padding: 10px;color: #757575">还没有收藏的版块</p>
          <Module v-for="item in collectList" :id="item.id" :key="item.id" :icon="item.icon" :moduleName="item.moduleName" ></Module>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
    <div class="cutLine">
    </div>
    <van-tabs v-model="active" title-active-color="#26a2ff" title-inactive-color="#000000" color="#26a2ff" animated swipeable>
      <van-tab  title="最新">
        <van-pull-refresh v-model="newest.refreshed" @refresh="loadTopNew">
          <van-list
            v-model="newest.loading"
            :finished="newest.finished"
            finished-text="--我是有底线的--"
            @load="loadBottomNewest"
            style="min-height: 300px"
          >
            <Forum
              v-for="item, idx in newest.data"
              :sid="item.sid"
              :idx="idx"
              type="newest"
              @changeThumbsUp="changeThumbsUp"
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
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab  title="最热">
        <van-pull-refresh v-model="hot.refreshed" @refresh="loadTopHot">
          <van-list
            v-model="hot.loading"
            :finished="hot.finished"
            finished-text="--我是有底线的--"
            @load="loadBottomHot"
            style="min-height: 300px"
          >
            <Forum
              v-for="item ,idx in hot.data"
              :sid="item.sid"
              :idx="idx"
              type="essence"
              @changeThumbsUp="changeThumbsUp"
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
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import Module from './components/Module'
import Forum from './components/Forum'

import axios from 'axios'
import { List, PullRefresh, Tab, Tabs } from 'vant'
export default {
  name: 'Home',
  components: {Module, Forum, vanTabs: Tabs, vanTab: Tab, vanList: List, vanPullRefresh: PullRefresh},
  data () {
    return {
      active: '',
      headerZindex: 0,
      refreshHeight: 0,
      selected: 'newest',
      choosen: true,
      moduleSelected: 'myColllect',
      forumSelected: 'newest',
      collectList: [],
      loadMoreTip: {
        newest: true,
        hot: true
      },
      data: {
        loading: true,
        type: 'hot',
        page: {
          current: 1,
          size: 10
        },
        data: []
      },
      hot: {
        loading: false,
        finished: false,
        refreshed: true,
        type: 'hot',
        page: {
          current: 1,
          size: 10
        },
        data: []
      },
      newest: {
        loading: false,
        finished: false,
        refreshed: true,
        type: 'newest',
        page: {
          current: 1,
          size: 10
        },
        data: []
      }
    }
  },
  activated () {
    this.tabHeader.title = '警务论坛'
    this.tabHeader.rightBtn = {
      url: './mAdvice',
      title: '我的'
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.state.headerZindex = 0
    this.tabHeader.leftBtn = '返回'
    // 设置下一个路由的 meta
    if (to.path != '/mAdvice') to.meta.keepAlive = false
    // B 跳转到 A 时，让 A 不缓存，即刷新（代码写在C页面）
    next()
  },
  beforeRouteEnter (to, from, next) {
    next()
  },
  methods: {
    changeThumbsUp (type, idx) {
      if (this[type].data[idx].like) {
        this[type].data[idx].likeCount -= 1
      } else {
        this[type].data[idx].likeCount += 1
      }
      this[type].data[idx].like = !this[type].data[idx].like
    },
    getCollect () {
      var that = this
      this.$http({
        method: 'post',
        url: 'module/collect/list',
        data: {
          uid: this.loginUser
        }
      }).then(res => {
        if (res.code === 200) {
          that.collectList = res.data
        } else {
          that.Toast(res.message)
        }
        console.log(res)
      })
    },
    loadBottomHot () {
      var that = this
      that.hot.loading = true
      this.requetData('hot', that.hot.page.current, 10).then(res => {
        if (res.suggestions.current >= res.suggestions.pages) {
          that.hot.finished = true
        }
        that.hot.data = [...that.hot.data, ...res.suggestions.records]
        that.hot.page.current += 1

        that.hot.loading = false
      }).catch(err => {
        that.hot.finished = true
        that.hot.loading = false
      })
    },
    loadBottomNewest () {
      var that = this
      that.newest.loading = true
      this.requetData('newest', that.newest.page.current, 10).then(res => {
        if (res.suggestions.current >= res.suggestions.pages) {
          that.newest.finished = true
        }
        that.newest.data = [...that.newest.data, ...res.suggestions.records]
        that.newest.page.current += 1

        that.newest.loading = false
      }).catch(err => {
        that.newest.finished = true
        that.newest.loading = false
      })
    },
    loadTopNew () {
      var that = this
      that.newest.page.current = 1
      this.requetData('newest', 1, 10).then(res => {
        that.newest.data = res.suggestions.records
        that.newest.page.current += 1
        that.newest.refreshed = false
      }).catch(err => {
        that.newest.refreshed = false
        // that.newest.loading = false
      })
    },
    loadTopHot () {
      var that = this
      that.hot.page.current = 1
      this.requetData('hot', 1, 10).then(res => {
        that.hot.data = res.suggestions.records
        that.hot.page.current += 1
        that.hot.refreshed = false
      }).catch(err => {
        that.hot.refreshed = false
      })
    },
    requetData (type, current, size) {
      var that = this
      return new Promise((resolve, reject) => {
        axios.post(that.baseURL + 'suggest/list', {uid: this.loginUser, scope: type, page: {current, size}}, {headers: {'Content-Type': 'application/json'}})
          .then(res => {
            if (res.data.code === 200) {
              if (res.data.data.suggestions.records.length) {
                resolve(res.data.data)
              } else {
                reject()
              }
            } else {

            }
          })
      })
    },
    toAllModule () {
      this.$router.push('allModule')
    }
  },
  watch: {
    indexCollectChange () {
      this.getCollect()
    }
  },
  computed: {
    ...mapState(['tabHeader', 'loginUser', 'indexCollectChange'])
  },
  created () {
    this.$store.state.headerZindex = 99
    var that = this
    this.tabHeader.title = '警务论坛'
    this.tabHeader.leftBtn = ''
    this.tabHeader.rightBtn = {
      url: './mAdvice',
      title: '我的'
    }
    // this.loadHeight = screen.availHeight
    // this.requetData('newest', 1, 10).then(res => {
    //   that.newest.data = res.suggestions.records
    //   that.newest.page.current += 1
    // })
    // this.requetData('hot', 1, 10).then(res => {
    //   that.hot.data = res.suggestions.records
    //   that.hot.page.current += 1
    // })
    this.getCollect()
  },
  mounted () {
    this.refreshHeight = screen.availHeight - 230
  }
}
</script>

<style scoped lang="scss">
  /deep/ .van-tabs--line .van-tabs__wrap{height:44px;width: 100px;margin-left: calc(100% - 100px)}
  /deep/.is-selected{
    border-bottom:none!important;
  }
  .homeApp{
    /*.mescroll {*/
    /*  position: fixed;*/
    /*  top: 202px;*/
    /*  bottom: 0;*/
    /*  height: auto;*/
    /*}*/
    .is-selected{
      border-bottom:none;
      color: $thmeFontColor;
    }
    .module{
      padding: 5px;
      overflow-x: scroll;
      white-space: nowrap;
    }
    .moduleStart{
      padding: 10px;
    }
    .cutLine{
      width: 100%;
      height: 4px;
      background: $bgColorSub;
    }
  }
</style>
