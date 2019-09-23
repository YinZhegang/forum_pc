<template>
  <div class="detail" style="margin: 0 auto;width: 800px">
    <el-dialog
      style="z-index: 9999"
      :title="'禁言：'+ forbidName"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <el-form label-position="top" ref="forbidFormReply" :rules="forbidFormReplyRules"  :model="forbidForm" label-width="80px">
        <el-form-item label="禁言时间" size="mini" prop="date">
          <el-radio-group v-model="forbidForm.date" size="mini">
            <el-radio size="mini" label="1">1天</el-radio>
            <el-radio size="mini" label="7">7天</el-radio>
            <el-radio size="mini" label="30">1月</el-radio>
            <el-radio size="mini" label="3650">永久</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="禁言板块" size="mini">
          {{moduleName}}
        </el-form-item>
        <el-form-item label="禁言原因" size="mini"  prop="reason">
          <el-input  :rows="3" type="textarea" maxlength="40" v-model.trim="forbidForm.reason"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('forbidForm')">立即禁言</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <mt-actionsheet
      :actions="actions"
      v-model="sheetVisible">
    </mt-actionsheet>
    <div style="position: fixed;z-index: 99;bottom: 0;display: flex;flex-flow: row nowrap;justify-content: space-between;width: 800px">
      <mt-button :disabled="this.forbid" type="default" @click="toReply" style="width: 50%;border-radius: 0;"><icon name="comments"  class="icon"></icon><span></span>  回复</mt-button>
      <mt-button @click="flag&&thumbsUp()" :disabled="thumbsUpDisabled" :style="{color: detail.like?'red':'#757575'}" type="default" style="width: 50%;border-radius: 0;"><icon name="thumbs-up"  class="icon"></icon>  {{detail.like?'取消点赞':'点赞'}}</mt-button>
    </div>
    <mescroll-vue ref="mescroll" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
      <div class="headCOnt">
        <div class="head">
          <img :src="detail.creator.avatar" />
          <div class="mine">
            <h5>{{detail.creator.name}}</h5>
            <p>{{detail.creatTime.slice(0,10)}}  {{detail.creatTime.slice(11,16)}}</p>
          </div>
          <div v-if="detail.creator.id==userId||detail.owner" @click="sheetVisibleOpen" style="z-index: 9999;top: 2rem;position: absolute;right: 1rem;margin-right: .8rem;color:#757575;"><i class="el-icon-more el-icon&#45;&#45;right"></i></div>
        </div>
        <div class="content">
          <h4>{{detail.title}}</h4>
          <P>{{detail.content}}</P>
          <div class="img">
            <img preview="index" v-for="item ,index in detail.files"  :key="index" :src="item.filePath" />
          </div>
        </div>
        <div class="footer">
          <p>发布于 {{detail.moduleName}}</p>
          <div class="footMutil">
            <div>
              <!--            <span  @click="flag&&thumbsUp()">-->
              <!--              <icon name="thumbs-up" class="icon" :style="{color:(detail.like?'red':'#409EFF')}"></icon><span>{{detail.likeCount}}</span>-->
              <!--            </span>-->
            </div>
          </div>
        </div>
      </div>
      <div class="cutLine">
      </div>
      <div class="comend">
        <div style="height: 20px;padding: 10px 20px;border-bottom: #f7f7f7 solid 1px;position: sticky;top:0;background: #fff;z-index: 99">
          <span style="display: inline-block;color: #26a2ff;font-size: 14px">回复&nbsp;{{total}}</span>
          <span style="padding-right: 10px;display: inline-block;float: right"  @click="flag&&thumbsUp()">
          <icon name="thumbs-up" class="icon" :style="{color:(detail.like?'red':'#409EFF')}"></icon><span>&nbsp;  {{detail.likeCount}}</span>
        </span>
        </div>
        <ReplyLzlDetail @forbidings="forbidings" v-for="item in records"  :records="item" :content="item.content" :createTime="item.createTime" :fromUser="item.fromUser" :replyId="item.replyId" :reviewId="item.reviewId" :toUser="item.toUser"></ReplyLzlDetail>
      </div>
    </mescroll-vue>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import ReplyLzlDetail from './components/ReplyLzlDetail'
import MescrollVue from 'mescroll.js/mescroll.vue'
import { Toast } from 'mint-ui'
import { MessageBox } from 'element-ui'
import axios from 'axios'
export default {
  name: 'replyDetail',
  components: {ReplyLzlDetail, MescrollVue},
  data () {
    return {
      userId: '',
      mescroll: null, // mescroll实例对象
      mescrollDown: {
        isBounce: false,
        callback: this.downCallback
      }, // 下拉刷新的配置. (如果下拉刷新和上拉加载处理的逻辑是一样的,则mescrollDown可不用写了)
      mescrollUp: {
        callback: this.upCallback,
        isBounce: true,
        page: {
          num: 0, // 当前页 默认0,回调之前会加1; 即callback(page)会从1开始
          size: 5 // 每页数据条数,默认10
        },
        htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>'
      },
      actions: [],
      forbidFormReplyRules: {
        date: [{ required: true, message: '请选择禁言时间', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入禁言原因', trigger: 'blur' }]
      },
      timeOutEvent: 0,
      sheetVisible: false,
      dialogVisible: false,
      forbidForm: {
        date: '1'
      },
      forbid: false,
      moduleSelected: 'myColllect',
      forumSelected: 'review',
      detail: {},
      total: 0,
      current: 1,
      size: 5,
      records: [],
      flag: true
    }
  },
  computed: {
    ...mapState(['tabHeader'])
  },
  methods: {
    toEdit (detail) {
      this.$router.push({path: './reply', query: {moduleId: this.$route.query.moduleId, reviewId: detail.reviewId, id: detail.sId}})
    },
    sheetVisibleOpen () {
      if (this.$store.state.loginUser == this.detail.creator.id) {
        if (this.forbid) {
          this.actions = [
            {name: '删除', method: this.suggest_delete.bind(this, this.detail)}
          ]
        } else {
          this.actions = [
            {name: '编辑', method: this.toEdit.bind(this, this.detail)},
            {name: '删除', method: this.suggest_delete.bind(this, this.detail)}
          ]
        }
        this.sheetVisible = true
      } else {
        if (this.detail.owner) {
          try {
            this.actions = [
              {name: '删除', method: this.suggest_delete},
              {name: '回复', method: this.toReply.bind(this, this.detail)}
            ]
            let a = {}
            if (!this.detail.creator.forbid) {
              a.name = '禁言'
              a.method = this.suggest_forbid_add_head.bind(this, this.detail)
            } else {
              a.name = '解除禁言'
              a.method = this.suggest_forbid_delete_head.bind(this, this.detail)
            }
            this.actions.push(a)
          } catch (e) {
            console.log(e)
          }

          this.sheetVisible = true
        } else {
          if (!this.forbid) {
          }
        }
      }
    },
    mescrollInit (mescroll) {
      this.mescroll = mescroll // 如果this.mescroll对象没有使用到,则mescrollInit可以不用配置
    },
    downCallback () {
      var that = this
      this.requestData(1, 5).then(res => {
        this.records = []
        that.records.push(...res.records)
        that.current = 1
        that.total = res.total
        this.mescroll.setPageNum(2)
        this.mescroll.endSuccess(res.records.length)
      })
      this.$http({
        method: 'post',
        url: 'review/detail',
        data: {
          reviewId: this.$route.query.reviewId,
          uid: that.$store.state.loginUser
        }
      }).then(res => {
        if (res.code === 200) {
          that.detail = res.data
          that.tabHeader.title = '评论详情'
          that.tabHeader.rightBtn = {
            url: '',
            title: ''
          }
          that.$previewRefresh()
        }
      })
    },
    upCallback (page, mescroll) {
      var that = this
      this.requestData(page.num, page.size).then(res => {
        if (page.num === 1) this.records = []
        that.records.push(...res.records)
        that.current += 1
        that.total = res.total
        this.mescroll.endSuccess(res.records.length)
      })
    },
    suggest_forbid_add_head (detail) {
      this.forbidName = detail.creator.name
      this.moduleName = detail.moduleName
      this.forbidForm.uid = detail.creator.id
      this.forbidForm.suggestionId = detail.sId
      // this.suggestionId = op.suggestionId
      this.dialogVisible = true
    },
    suggest_forbid_delete_head (detail) {
      this.forbidForm.suggestionId = detail.sId
      this.$http({
        method: 'post',
        url: 'user/black/delete',
        data: {
          uid: detail.creator.id,
          moduleId: this.$route.query.moduleId,
          creator: this.$store.state.loginUser
        }
      }).then(res => {
        if (res.code == 200) {
          Toast('解除禁言成功')
          this.reLoadData()
        }
      })
    },
    suggest_forbid (actionType, item) {
      var that = this
      if (actionType == 'add') {
        this.forbidName = item.fromUser.name
        this.moduleName = item.moduleName
        this.forbidForm.uid = item.fromUser.id
        this.forbidForm.suggestionId = this.detail.sId
        // this.suggestionId = op.suggestionId
        this.dialogVisible = true
      } else {
        this.forbidForm.suggestionId = this.detail.sId
        this.$http({
          method: 'post',
          url: 'user/black/delete',
          data: {
            uid: item.fromUser.id,
            moduleId: that.$route.query.moduleId,
            creator: that.$store.state.loginUser
          }
        }).then(res => {
          if (res.code == 200) {
            Toast('解除禁言成功')
            that.reLoadData()
          }
        })
      }
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
      axios.post(this.baseURL + 'user/black/add', {
        uid: this.forbidForm.uid,
        userType: 1,
        creator: that.$store.state.loginUser,
        creatorType: 1,
        moduleId: that.$route.query.moduleId,
        reason: this.forbidForm.reason,
        suggestionId: this.$route.query.reviewId,
        startTime: this.GetDateStr(0),
        endTime: this.GetDateStr(Number(this.forbidForm.date))
      }, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            Toast('禁言成功')
            that.dialogVisible = false
            that.reLoadData()
          }
        })
    },
    suggest_delete_reply (record) {
      var that = this
      MessageBox.prompt('删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        this.$http({
          method: 'post',
          url: 'reply/delete',
          data: {
            replyId: record.replyId,
            reason: value
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            setTimeout(() => {
              that.reLoadData()
            }, 500)
          }
        })
      })
    },
    suggest_delete () {
      var that = this
      MessageBox.prompt('删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        this.$http({
          method: 'post',
          url: 'review/delete',
          data: {
            reviewId: that.detail.reviewId,
            reason: value
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            setTimeout(() => {
              that.$router.go(-1)
            }, 500)
          }
          console.log(res)
        })
      })
    },
    toEditReply (record) {
      this.$router.push({path: './replyLzl', query: {moduleId: this.$route.query.moduleId, replyId: record.replyId}})
    },
    forbidings (item) {
      if (this.$store.state.loginUser == item.fromUser.id) {
        if (this.forbid) {
          this.actions = [
            {name: '删除', method: this.suggest_delete_reply.bind(this, item)}
          ]
        } else {
          this.actions = [
            {name: '回复', method: this.toReplyLzl.bind(this, item)},
            {name: '编辑', method: this.toEditReply.bind(this, item)},
            {name: '删除', method: this.suggest_delete_reply.bind(this, item)}
          ]
        }
        this.sheetVisible = true
      } else {
        if (this.detail.owner) {
          try {
            this.actions = [
              {name: '删除', method: this.suggest_delete_reply.bind(this, item)},
              {name: '回复', method: this.toReplyLzl.bind(this, item)}
            ]
            let a = {}
            if (!item.fromUser.forbid) {
              a.name = '禁言'
              a.method = this.suggest_forbid_add.bind(this, item)
            } else {
              a.name = '解除禁言'
              a.method = this.suggest_forbid_delete.bind(this, item)
            }
            this.actions.push(a)
          } catch (e) {
            console.log(e)
          }

          this.sheetVisible = true
        } else {
          if (!this.forbid) {
            this.actions = [
              {name: '回复', method: this.toReplyLzl.bind(this, item)}
            ]
            this.sheetVisible = true
          }
        }
      }
      console.log(item)
    },
    suggest_forbid_add (item) {
      this.suggest_forbid('add', item)
    },
    suggest_forbid_delete (item) {
      this.suggest_forbid('delete', item)
    },
    thumbsUp () {
      var that = this
      this.flag = false
      axios.post(that.baseURL + `like/${that.detail.like ? 'cancel' : 'add'}`, {creator: that.$store.state.loginUser, creatorType: 1, reviewId: this.detail.reviewId}, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            this.flag = true
            if (that.detail.like) {
              that.detail.likeCount -= 1
            } else {
              that.detail.likeCount += 1
            }
            that.detail.like = !that.detail.like
          }
        })
    },
    comment () {

    },
    commentLzl () {

    },
    toReplyLzl (item) {
      this.$router.push({path: './replyLzl', query: {reviewId: this.$route.query.reviewId, id: this.$route.query.id, toUid: item.fromUser.id}})
    },
    toReply () {
      this.$router.push({path: './replyLzl', query: {reviewId: this.$route.query.reviewId, id: this.$route.query.id, toUid: this.detail.creator.id}})
    },
    requestData (current, size) {
      var that = this
      return new Promise(resolve => {
        this.$http({
          method: 'post',
          url: 'reply/list',
          data: {
            reviewId: this.$route.query.reviewId,
            current: current,
            size: size
          }
        }).then(res => {
          if (res.code === 200) {
            resolve(res.data)
          }
        })
      })
    },
    reLoadData () {
      var that = this
      this.requestData(1, 5).then(res => {
        this.records = []
        that.records.push(...res.records)
        that.current = 1
        that.total = res.total
        that.mescroll.setPageNum(2)
        that.mescroll.endSuccess(res.records.length)
      })
      this.$http({
        method: 'post',
        url: 'review/detail',
        data: {
          reviewId: this.$route.query.reviewId,
          uid: that.$store.state.loginUser
        }
      }).then(res => {
        if (res.code === 200) {
          that.mescroll.scrollTo(0, 0)
          that.detail = res.data
          that.tabHeader.title = '评论详情'
          that.tabHeader.rightBtn = {
            url: '',
            title: ''
          }
          that.$previewRefresh()
        }
      })
    }
  },
  created () {
    this.$store.state.headerZindex = 0
  },
  mounted () {
    this.loadHeight = document.documentElement.clientHeight - 80
    var that = this
    this.$http({
      method: 'post',
      url: 'review/detail',
      data: {
        reviewId: this.$route.query.reviewId,
        uid: that.$store.state.loginUser
      }
    }).then(res => {
      if (res.code === 200) {
        that.detail = res.data
        that.forbid = res.data.forbid
        that.userId = that.$store.state.loginUser
        that.tabHeader.title = '评论详情'
        that.tabHeader.rightBtn = {
          url: '',
          title: ''
        }
        that.$previewRefresh()
      }
    })
  }
}
</script>

<style scoped lang="scss">
  .mescroll {
    z-index: 9;
    position: fixed;
    top: 40px;
    bottom: 0;
    height: calc(100% - 80px);
    width: 800px;
  }
  .detail{
    .is-selected{
      border-bottom-color: $thmeFontColor;
      color: $thmeFontColor;
    }
    padding-top: 2.5rem;
    box-sizing: border-box;
    .headCOnt{
      padding: .6rem .8rem;
      border-bottom: 1px solid #f6f6f6;
      position: relative;
      .head{
        img{
          width: 50px;
          height: 50px;
          border-radius: 50px;
        }
        .mine{
          display: inline-block;
          margin: 0 .2rem;
          position: relative;
          top: -.4rem;
          h5{
            font-size: 1rem;
          }
          p{
            margin-top: .2rem;
            font-size: .6rem;
            color: $fontColorSub;
          }
        }
      }
      .content{
        h4{
          margin-top: .2rem;
          box-sizing: border-box;
        }
        P{
          margin-top: .3rem;
          box-sizing: border-box;
          color: $fontColorSub;
          line-height: 1.4rem;
        }
        .img{
          margin-top: .4rem;
          box-sizing: border-box;
          justify-content: space-between;
          display: flex;
          flex-flow: row wrap;
          align-items: start;
          img{
            width: 100%;
          }
        }
      }
      .footer{
        padding: .4rem 0;
        display: flex;
        justify-content: space-between;
        .footMutil{
          display: flex;
          .icon{
            color: $thmeColorSub;
            margin: 0 .3rem;
          }
          span{
            color: $fontColorSub;
          }
        }
      }
    }
    .cutLine{
      width: 100%;
      height: .35rem;
      background: $bgColorSub;
    }
    .comend{
      position: relative;
    }
  }
</style>
