<template>
  <div class="model" id="top" style="width: 800px;margin: 0 auto">
    <el-dialog
      :title="'禁言：'+ forbidName"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <el-form label-position="top" :rules="forbidFormRules" ref="forbidFormModule" :model="forbidForm" label-width="80px">
        <el-form-item label="禁言时间" size="mini" prop="date">
          <el-radio-group v-model="forbidForm.date" size="mini">
            <el-radio size="mini" label="1">1天</el-radio>
            <el-radio size="mini" label="7">7天</el-radio>
            <el-radio size="mini" label="30">1月</el-radio>
            <el-radio size="mini" label="3650">永久</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="禁言版块" size="mini">
          {{this.header.moduleName}}
        </el-form-item>
        <el-form-item label="禁言原因" size="mini" prop="reason">
          <el-input  :rows="3" maxlength="40" type="textarea"  v-model.trim="forbidForm.reason"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('forbidForm')">立即禁言</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div v-if="!forbid" @click="toPost" style="box-shadow:rgba(117,117,117,0.67) 4px 3px 2px;position: fixed;bottom: 50px;right: 25%;z-index: 99;font-size: 1.6rem;color: #ffffff;background: #26a2ff;border-radius: 100px;width: 60px;height: 60px;text-align: center;line-height: 60px"><i class="el-icon-edit"></i></div>
    <div v-else style="position: fixed;bottom: 50px;right: 25%;z-index: 9999;font-size: 1.6rem; color: #ffffff;background: #757575;border-radius: 100px;width: 60px;height: 60px;text-align: center;line-height: 60px"><i class="el-icon-edit"></i></div>
    <div class="head nav-top  mescroll-touch">
      <img :src="header.icon">
      <div class="head_cont">
        <h3 style="text-overflow:ellipsis;
        white-space:nowrap;
        -webkit-line-clamp:1;
        overflow: hidden;">{{header.moduleName}}</h3>
        <p>收藏：{{header.collectionCount}} &nbsp;&nbsp;帖子：{{header.suggestionCount}}</p>
      </div>
      <mt-button @click="collectIt"  :type="header.collect?'default':'primary'" style="height: 2.2rem;position: relative;top: .6rem;font-size: .7rem;width: 5.5rem">{{header.collect?'取消收藏':'收藏'}}</mt-button>
    </div>
    <div class="content">
      <van-tabs v-model="active" title-active-color="#26a2ff" title-inactive-color="#000000" color="#26a2ff" swipeable>
        <van-tab title="全部">
          <van-pull-refresh v-model="all.refreshed" @refresh="loadTopAll">
            <van-list
              v-model="all.loading"
              :finished="all.finished"
              finished-text="--我是有底线的--"
              @load="loadBottomAll"
              style="min-height: 300px"
            >
              <Forum
                :idx="idx"
                type="all"
                ref="forumAll"
                @changeThumbsUp="changeThumbsUp"
                @forbiding="forbiding"
                @reloadData="reloadData('all')"
                v-for="item, idx in all.data"
                :moduleId="item.moduleId"
                :isDropDown="true"
                :forbid="forbid"
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
            </van-list>
          </van-pull-refresh>
        </van-tab>
        <van-tab title="精华">
          <van-pull-refresh v-model="essence.refreshed" @refresh="loadTopEssence">
            <van-list
              v-model="essence.loading"
              :finished="essence.finished"
              finished-text="--我是有底线的--"
              @load="loadBottomEssence"
              style="min-height: 300px"
            >
              <Forum
                :idx="idx"
                type="essence"
                @changeThumbsUp="changeThumbsUp"
                @forbiding="forbiding"
                @reloadData="reloadData('essence')"
                v-for="item, idx in essence.data"
                :moduleId="item.moduleId"
                :isDropDown="true"
                :forbid="forbid"
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
            </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import Forum from './components/Forum'
import axios from 'axios'
import {mapState} from 'vuex'
import { Toast } from 'mint-ui'
import {List, PullRefresh, Tab, Tabs } from 'vant'
export default {
  name: 'Module',
  components: {Forum, vanTabs: Tabs, vanTab: Tab, vanList: List, VanPullRefresh: PullRefresh},
  data () {
    return {
      header: '',
      all: {
        loading: false,
        finished: false,
        refreshed: true,
        type: 'newest',
        page: {
          current: 1,
          size: 10
        },
        data: []
      },
      essence: {
        loading: false,
        finished: false,
        refreshed: true,
        type: 'newest',
        page: {
          current: 1,
          size: 10
        },
        data: []
      },
      active: '',
      forbidFormRules: {
        date: [{ required: true, message: '请选择禁言时间', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入禁言原因', trigger: 'blur' }]
      },
      forbidName: '',
      forbidForm: {
        date: '1'
      },
      dialogVisible: false,
      forbid: false,
      forumSelected: 'all',
      collect: false
    }
  },
  created () {
    this.$store.state.headerZindex = 9
    this.tabHeader.rightBtn = {
      url: '',
      title: ''
    }
  },
  methods: {
    loadTopAll () {
      var that = this
      that.all.page.current = 1
      this.requetData('all', 1, 10).then(res => {
        that.all.finished = false
        if (res.suggestions.current >= res.suggestions.pages) {
          that.all.finished = true
        }
        that.all.data = []
        that.$nextTick(() => {
          that.all.data = res.suggestions.records
        })
        that.all.page.current = 2
        that.all.refreshed = false
        that.$forceUpdate()
      }).catch(res => {
        that.forbid = res.forbid
        that.header = res.module
        that.all.data = []
        that.$forceUpdate()
        that.all.refreshed = false
        // that.newest.loading = false
      })
    },
    loadBottomAll () {
      var that = this
      that.all.loading = true
      this.requetData('all', that.all.page.current, 10).then(res => {
        that.tabHeader.title = res.module.moduleName
        if (res.suggestions.current >= res.suggestions.pages) {
          that.all.finished = true
        }
        that.forbid = res.forbid
        that.header = res.module
        that.all.data = [...that.all.data, ...res.suggestions.records]
        that.all.page.current += 1
        that.$forceUpdate()
        that.all.loading = false
      }).catch(res => {
        that.forbid = res.forbid
        that.header = res.module
        that.all.data = []
        that.$forceUpdate()
        that.all.finished = true
        that.all.loading = false
      })
    },
    loadTopEssence () {
      var that = this
      that.essence.page.current = 1
      this.requetData('essence', 1, 10).then(res => {
        that.essence.finished = false
        if (res.suggestions.current >= res.suggestions.pages) {
          that.essence.finished = true
        }
        that.essence.data = []
        that.$nextTick(() => {
          that.essence.data = res.suggestions.records
        })
        that.essence.page.current = 2
        that.essence.refreshed = false
        that.$forceUpdate()
      }).catch(res => {
        that.forbid = res.forbid
        that.header = res.module
        that.essence.data = []
        that.$forceUpdate()
        that.essence.refreshed = false
        // that.newest.loading = false
      })
    },
    loadBottomEssence () {
      var that = this
      that.essence.loading = true
      this.requetData('essence', that.essence.page.current, 10).then(res => {
        that.tabHeader.title = res.module.moduleName
        if (res.suggestions.current >= res.suggestions.pages) {
          that.essence.finished = true
        }
        that.forbid = res.forbid
        that.header = res.module
        that.essence.data = [...that.essence.data, ...res.suggestions.records]
        that.essence.page.current += 1
        that.$forceUpdate()
        that.essence.loading = false
      }).catch(res => {
        that.forbid = res.forbid
        that.header = res.module
        that.essence.data = []
        that.$forceUpdate()
        that.essence.finished = true
        that.essence.loading = false
      })
    },
    changeThumbsUp (type, idx) {
      if (this[type].data[idx].like) {
        this[type].data[idx].likeCount -= 1
      } else {
        this[type].data[idx].likeCount += 1
      }
      this[type].data[idx].like = !this[type].data[idx].like
    },
    reloadData (type) {
      var that = this
      return new Promise((resolve, reject) => {
        that.requetData(type == 'all' ? 'all' : 'essence', 1, 10).then(res => {
          that.forbid = res.forbid
          that.header = res.module
          that.tabHeader.title = res.module.moduleName
          that[type == 'all' ? 'all' : 'essence'].finished = false
          if (res.suggestions.current >= res.suggestions.pages) {
            that[type == 'all' ? 'all' : 'essence'].finished = true
          }
          that[type == 'all' ? 'all' : 'essence'].page.current = 2
          that[type == 'all' ? 'all' : 'essence'].data = []
          that.$nextTick(() => {
            that[type == 'all' ? 'all' : 'essence'].data = res.suggestions.records
            that.$forceUpdate()
            that.requetData(type == 'all' ? 'essence' : 'all', 1, 10).then(res => {
              that.forbid = res.forbid
              that.header = res.module
              that.tabHeader.title = res.module.moduleName
              that[type == 'all' ? 'essence' : 'all'].finished = false
              if (res.suggestions.current >= res.suggestions.pages) {
                that[type == 'all' ? 'essence' : 'all'].finished = true
              }
              that[type == 'all' ? 'essence' : 'all'].page.current = 2
              that[type == 'all' ? 'essence' : 'all'].data = []
              that.$nextTick(() => {
                that[type == 'all' ? 'essence' : 'all'].data = res.suggestions.records
                that.$forceUpdate()
                resolve()
              })
            }).catch(res => {
              that.forbid = res.forbid
              that.header = res.module
              that[type == 'all' ? 'essence' : 'all'].page.current = 1
              that[type == 'all' ? 'essence' : 'all'].data = []
              that.$forceUpdate()
              resolve()
            })
          })
        }).catch(res => {
          that.forbid = res.forbid
          that.header = res.module
          that[type == 'all' ? 'all' : 'essence'].page.current = 1
          that[type == 'all' ? 'all' : 'essence'].data = []
          that.$forceUpdate()
          that.requetData(type == 'all' ? 'essence' : 'all', 1, 10).then(res => {
            that.forbid = res.forbid
            that.header = res.module
            that.tabHeader.title = res.module.moduleName
            that[type == 'all' ? 'essence' : 'all'].finished = false
            if (res.suggestions.current >= res.suggestions.pages) {
              that[type == 'all' ? 'essence' : 'all'].finished = true
            }
            that[type == 'all' ? 'essence' : 'all'].page.current = 2
            that[type == 'all' ? 'essence' : 'all'].data = []
            that.$nextTick(() => {
              that[type == 'all' ? 'essence' : 'all'].data = res.suggestions.records
              that.$forceUpdate()
              resolve()
            })
          }).catch(res => {
            that.forbid = res.forbid
            that.header = res.module
            that[type == 'all' ? 'essence' : 'all'].page.current = 1
            that[type == 'all' ? 'essence' : 'all'].data = []
            that.$forceUpdate()
            resolve()
          })
        })
      })
    },
    GetDateStr (AddDayCount) {
      var dd = new Date()
      dd.setDate(dd.getDate() + AddDayCount)// 获取AddDayCount天后的日期
      var y = dd.getFullYear()
      var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1)// 获取当前月份的日期，不足10补0
      var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate()// 获取当前几号，不足10补0
      return y + '-' + m + '-' + d
    },
    submitForm () {
      var that = this
      console.log(this.forbidForm)
      this.$refs.forbidFormModule.validate(valid => {
        if (!valid) return false
        axios.post(this.baseURL + 'user/black/add', {
          uid: this.creator,
          userType: 1,
          creator: that.$store.state.loginUser,
          creatorType: 1,
          moduleId: this.moduleId,
          suggestionId: this.suggestionId,
          reason: this.forbidForm.reason,
          startTime: this.GetDateStr(0),
          endTime: this.GetDateStr(Number(this.forbidForm.date))
        }, {headers: {'Content-Type': 'application/json'}})
          .then(res => {
            if (res.data.code === 200) {
              Toast('禁言成功')
              that.dialogVisible = false
              that.reloadData()
            }
          })
      })
    },
    forbiding (op) {
      var that = this
      if (op.type == 'add') {
        this.forbidName = op.name
        this.creator = op.creator
        this.moduleId = op.moduleId
        this.suggestionId = op.suggestionId
        this.dialogVisible = true
      } else {
        this.$http({
          method: 'post',
          url: 'user/black/delete',
          data: {
            uid: op.creator,
            moduleId: this.header.moduleId,
            creator: that.$store.state.loginUser
          }
        }).then(res => {
          if (res.code == 200) {
            Toast('解除禁言成功')
            that.dialogVisible = false
            that.reloadData()
          }
        })
      }
      console.log(op)
    },
    collectIt () {
      var that = this
      this.$http({
        method: 'post',
        url: `module/collect/${this.header.collect ? 'cancel' : 'add'}`,
        data: {
          uid: that.$store.state.loginUser,
          moduleId: this.header.moduleId
        }
      }).then(res => {
        if (res.code == 200) {
          that.header.collect = !that.header.collect
          that.$store.state.indexCollectChange += 1
        }
      })
    },
    toPost () {
      this.$router.push({path: './post', query: {moduleId: this.$route.query.moduleId}})
    },
    requetData (type, current, size) {
      var that = this
      return new Promise((resolve, reject) => {
        axios.post(that.baseURL + 'suggest/list', {moduleId: that.$route.query.moduleId, uid: that.$store.state.loginUser, scope: type, page: {current, size}}, {headers: {'Content-Type': 'application/json'}})
          .then(res => {
            if (res.data.code === 200) {
              if (res.data.data.suggestions.records.length) {
                resolve(res.data.data)
              } else {
                reject(res.data.data)
              }
            }
          })
      })
    }
  },
  computed: {
    ...mapState(['tabHeader'])
  }
}
</script>

<style scoped lang="scss">
  /deep/ .van-tabs--line .van-tabs__wrap{height:44px;width: 100px;margin-left: calc(100% - 100px)}
  .mescroll {
    z-index: 999;
    position: fixed;
    top: 156px;
    bottom: 0;
    height: calc(100% - 156px);
  }
  .model{
    .collectBtn{
      background-color: $thmeFontColor;
    }
    .is-selected{
      border-bottom-color: $thmeFontColor;
      color: $thmeFontColor;
    }
    padding-top: 40px;
    .head{
      padding: .5rem;
      border-bottom: 1px solid #f6f6f6;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      .head_cont{
        width: 50%;
      }
      img{
        width: 50px;
        height: 50px;
        border-radius: 50px;
      }
    }
  }
</style>
