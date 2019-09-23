<template>
    <div style="padding-top: 2.5rem;width: 800px;margin: 0 auto" class="allmodule">
      <van-tabs v-model="active" title-active-color="#26a2ff" title-inactive-color="#000000" color="#26a2ff" animated swipeable>
        <van-tab v-for="item, idxx in mod" :title="item.name">
          <div style="min-height: 300px">
            <ModuleListItem  @changeCollect="changeCollect" type="1" v-for="it, index in item.data" :moduleName="it.moduleName" :idxx="idxx" :idx="index" :moduleId="it.moduleId" :description="it.description" :icon="it.icon" :collect="it.collect">{{it.description}}</ModuleListItem>
          </div>
        </van-tab>
      </van-tabs>

<!--      <mt-navbar v-model="selected" class="navbar">-->
<!--        <mt-tab-item :id="item.id" :key="item.id" v-for="item in classes" class="navItem">{{item.name}}</mt-tab-item>-->
<!--      </mt-navbar>-->
<!--      <mt-tab-container v-model="selected" style="margin-top: 5.4rem">-->
<!--        <mt-tab-container-item :id="item.id" v-for="item, idxx in mod">-->
<!--          <ModuleListItem  @changeCollect="changeCollect" type="1" v-for="it, index in item.data" :moduleName="it.moduleName" :idxx="idxx" :idx="index" :moduleId="it.moduleId" :description="it.description" :icon="it.icon" :collect="it.collect">{{it.description}}</ModuleListItem>-->
<!--        </mt-tab-container-item>-->
<!--      </mt-tab-container>-->
    </div>
</template>

<script>
import {mapState} from 'vuex'
import ModuleListItem from './components/ModuleListItem'
import { Tab, Tabs } from 'vant'
import {Toast} from 'mint-ui'
export default {
  name: 'AllModule',
  components: {ModuleListItem, VanTabs: Tabs, VanTab: Tab},
  data () {
    return {
      active: '',
      selected: '',
      classes: [],
      mod: []
    }
  },
  computed: {
    ...mapState(['tabHeader'])
  },
  methods: {
    changeCollect (idxx, idx) {
      // alert(idxx)
      // alert(idx)
      // console.log(this.mod)
      this.mod[idxx].data[idx].collect = !this.mod[idxx].data[idx].collect
    },
    async getClass () {
      var that = this
      return new Promise((resolve, reject) => {
        that.$get('category/list').then(res => {
          if (res.code === 200) {
            resolve(res.data)
          } else {
            Toast(res.message)
          }
        })
      })
    },
    async getModule () {
      var that = this
      let res = await this.getClass()
      this.classes = res
      this.selected = res[0].id
      for (let i = 0; i < res.length; i++) {
        this.$http({
          method: 'post',
          url: 'module/list',
          data: {
            uid: that.$store.state.loginUser,
            cId: res[i].id
          }
        }).then(re => {
          let has = that.mod.some((item, index) => {
            if (re.data.length === 0) {
              return false
            } else {
              return item.id === re.data[0].cId
            }
          })
          if (!has) {
            that.mod.push({
              orderNum: res[i].orderNum,
              name: res[i].name,
              id: res[i].id,
              data: re.data.reverse()
            })
          }
          if (i === res.length - 1) {
            that.mod.sort((a, b) => {
              return b.orderNum - a.orderNum
            })
          }
          Indicator.close()
          that.$forceUpdate()
        })
      }
    }
  },
  mounted () {
    this.$store.state.headerZindex = 99
    this.tabHeader.title = '全部版块'
    this.tabHeader.rightBtn = {
      url: './newModule',
      title: '新建'
    }
    this.getModule()
  },
  watch: {
    selected (n, o) {

    }
  }
}
</script>

<style scoped lang="scss">
  .allmodule{
    .is-selected{
      border-bottom-color: $thmeFontColor;
      color: $thmeFontColor;
    }
    .navbar{
      position: fixed;
      z-index: 99999;
      top: 2.5rem;
      overflow-y: auto;
      width: 100%;
      &::-webkit-scrollbar {
        display: none;
      }
      .navItem{
        min-width: 4rem;
        text-align: center;
        margin: 0 .3rem;
      }
    }
  }

</style>
