<template>
  <div class="detail" id="detail" style="margin: 0 auto;width: 800px">
    <el-dialog
      style="z-index: 9999"
      :title="'禁言：'+ forbidName"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <el-form label-position="top" :rules="forbidFormRules" ref="forbidFormDetail" :model="forbidForm" label-width="80px">
        <el-form-item label="禁言时间" size="mini" prop="date">
          <el-radio-group v-model="forbidForm.date" size="mini">
            <el-radio size="mini"  label="1">1天</el-radio>
            <el-radio size="mini" label="7">7天</el-radio>
            <el-radio size="mini" label="30">1月</el-radio>
            <el-radio size="mini" label="3650">永久</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="禁言板块" size="mini">
          {{detail.moduleName}}
        </el-form-item>
        <el-form-item label="禁言原因" size="mini" prop="reason">
          <el-input  :rows="3" maxlength="40" type="textarea" v-model.trim="forbidForm.reason"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('forbidForm')">立即禁言</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div style="position: fixed;bottom: 0;display: flex;flex-flow: row nowrap;justify-content: space-between;width: 800px">
      <!--        <mt-button type="default" style="width: 33%;border-radius: 0;"><icon name="share-alt"  class="icon"></icon>  分享</mt-button>-->
      <mt-button type="default" :disabled="forbid"  @click="toReply" style="width:50%;border-radius: 0;"><icon name="comments"  class="icon"></icon><span></span>  回复</mt-button>
      <mt-button @click="thumbsUp" :disabled="thumbsUpDisabled" :style="{color: detail.like?'red':'#757575'}" type="default" style="width: 50%;border-radius: 0;"><icon name="thumbs-up"  class="icon"></icon>  {{detail.like?'取消点赞':'点赞'}}</mt-button>
    </div>
    <mescroll-vue ref="mescroll" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
      <div class="headCOnt">
        <div class="head">
          <img :src="detail.creator.avatar" />
          <div class="mine">
            <h5>{{detail.creator.name}}</h5>
            <p>{{detail.createTime.slice(0,10)}}  {{detail.createTime.slice(11,16)}}</p>
          </div>
          <!--          <div @click="popupVisible =true" style="float: right;position: relative;margin-right: .5rem;color:#757575;font-size: 2rem">...</div>-->
        </div>
        <div class="content">
          <h4>{{detail.title}}</h4>
          <P style="white-space: pre-wrap">{{detail.content}}</P>
          <div class="img">
            <img preview="index" v-for="(item ,index) in detail.files" :key="index" :src="item.filePath">
          </div>
        </div>
        <div class="footer">
          <p>发布于 {{detail.moduleName}}</p>
          <div class="footMutil">
            <div>
              <icon name="eye" class="icon"></icon><span>{{detail.skimCount}}</span>
              <icon name="share-alt"  class="icon"></icon><span>{{detail.shareCount}}</span>
            </div>
          </div>
        </div>
        <div v-if="detail.creator.id==userId||detail.owner" @click="sheetVisible=true" style=";top: 2rem;position: absolute;right: 1rem;margin-right: .8rem;color:#757575;"><i class="el-icon-more el-icon&#45;&#45;right"></i></div>
        <mt-actionsheet
          :actions="actions"
          v-model="sheetVisible">
        </mt-actionsheet>
      </div>

      <div class="cutLine">
      </div>
      <div class="comend" id="comend">
        <div style="position: sticky;top: -1px;height: 20px;padding: 10px 20px;border-bottom: #f7f7f7 solid 1px;background: #fff;z-index: 99">
          <span style="display: inline-block;color: #26a2ff;font-size: 14px">回复&nbsp;{{total}}</span>
          <span style="display: inline-block;color: #26a2ff;font-size: 14px;float: right">点赞&nbsp;{{detail.likeCount}}</span>
        </div>
        <Reply v-for="item in records" @reloadPage="reloadPage" @openForbid="openForbid" :forbid="forbid" :moduleId="detail.moduleId" :moduleName="detail.moduleName" :mouduleOwn="detail.owner" :like="item.like" :likeCount="item.likeCount" :reviewId="item.reviewId" :creator="item.creator" :content="item.content" :creatTime="item.creatTime" :files="item.files" :replies="item.replies"></Reply>
      </div>
    </mescroll-vue>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { Toast } from 'mint-ui'
import wowLoadmore from '@/common/component/wowLoadmore'
import Reply from './components/Reply'
import MescrollVue from 'mescroll.js/mescroll.vue'
import axios from 'axios'
import { MessageBox } from 'element-ui'
export default {
  name: 'detail',
  components: {Reply, wowLoadmore, MescrollVue},
  data () {
    return {
      forbidUid: '',
      forbid: false,
      mescroll: null, // mescroll实例对象
      mescrollDown: {
        isBounce: false,
        callback: this.downCallback
      }, // 下拉刷新的配置. (如果下拉刷新和上拉加载处理的逻辑是一样的,则mescrollDown可不用写了)
      mescrollUp: {
        callback: this.upCallback,
        page: {
          num: 0, // 当前页 默认0,回调之前会加1; 即callback(page)会从1开始
          size: 5 // 每页数据条数,默认10
        },
        htmlNodata: '<p class="upwarp-nodata">-- 我是有底线的 --</p>'
      },
      total: 0,
      sheetVisible: false,
      isLoaded: false,
      forbidName: '',
      forbidForm: {
        date: '1'
      },
      forbidFormRules: {
        date: [{ required: true, message: '请选择禁言时间', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入禁言原因', trigger: 'blur' }]
      },
      dialogVisible: false,
      userId: '',
      moduleSelected: 'myColllect',
      forumSelected: 'review',
      detail: {},
      records: [],
      current: 1,
      thumbsUpDisabled: false
    }
  },
  computed: {
    ...mapState(['tabHeader']),
    actions () {
      let action = []
      if (!this.detail.creator.forbid) {
        let edit1 = this.detail.creator.id === this.userId ? {name: '编辑', method: this.goEdit} : ''
        if (edit1) action.push(edit1)
      }
      let edit2 = this.detail.creator.id === this.userId || this.detail.owner ? {name: '删除', method: this.suggest_delete} : ''
      if (edit2) action.push(edit2)
      if (this.detail.owner) {
        let top = !this.detail.top ? {name: '置顶', method: this.suggest_top_add} : {
          name: '取消置顶',
          method: this.suggest_top_cancel
        }
        action.push(top)
        let essence = !this.detail.essence ? {name: '设为精华', method: this.suggest_essence_add} : {
          name: '取消精华',
          method: this.suggest_essence_cancel
        }
        action.push(essence)
        let forbid =
            this.detail.creator.id != this.userId ? (!this.detail.creator.forbid ? {name: '禁言', method: this.suggest_forbid_add} : {
              name: '解除禁言',
              method: this.suggest_forbid_delete
            }) : ''

        if (forbid) action.push(forbid)
      }
      console.log(action)
      console.log(this.detail.top)
      return action
    }

  },
  methods: {
    reloadPage () {
      this.reLoadData()
      this.reLoadList()
    },
    openForbid (data) {
      this.forbiding({type: 'add', creator: data.uid, name: data.forbidName, moduleId: this.detail.moduleId, suggestionId: this.detail.sid})
    },
    mescrollInit (mescroll) {
      this.mescroll = mescroll // 如果this.mescroll对象没有使用到,则mescrollInit可以不用配置
    },
    downCallback () {
      var that = this
      this.requestData(1, 5).then(res => {
        that.records = []
        that.total = res.total
        that.records = res.records
        that.current += 1
        that.mescroll.setPageNum(2)
        that.mescroll.endSuccess(res.records.length)
      })
      that.reLoadData()
    },
    upCallback (page, mescroll) {
      var that = this
      this.requestData(page.num, page.size).then(res => {
        if (page.num === 1) this.records = []
        that.total = res.total
        that.records = [...that.records, ...res.records]
        that.current += 1
        mescroll.endSuccess(res.records.length)
      })
    },
    goEdit () {
      this.$router.push({path: './post', query: {moduleId: this.detail.moduleId, sid: this.detail.sid}})
    },
    suggest_essence_add () {
      this.suggest_essence('add')
    },
    suggest_essence_cancel () {
      this.suggest_essence('cancel')
    },
    suggest_forbid_add () {
      this.suggest_forbid('add')
    },
    suggest_forbid_delete () {
      this.suggest_forbid('delete')
    },
    suggest_top_add () {
      this.suggest_top('add')
    },
    suggest_top_cancel () {
      this.suggest_top('cancel')
    },
    GetDateStr (AddDayCount) {
      var dd = new Date()
      dd.setDate(dd.getDate() + AddDayCount)// 获取AddDayCount天后的日期
      var y = dd.getFullYear()
      var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1)// 获取当前月份的日期，不足10补0
      var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate()// 获取当前几号，不足10补0
      return y + '-' + m + '-' + d
    },
    handleCommand (command) {
      switch (command) {
        case 'suggest_delete':
          this.suggest_delete()
          break
        case 'edit':
          this.$router.push({path: './post', query: {moduleId: this.detail.moduleId, sid: this.detail.sid}})
          break
        case 'top':
          this.suggest_top('add')
          break
        case 'cancel_top':
          this.suggest_top('cancel')
          break
        case 'essence':
          this.suggest_essence('add')
          break
        case 'cancel_essence':
          this.suggest_essence('cancel')
          break
        case 'forbid':
          this.suggest_forbid('add')
          break
        case 'cancel_forbid':
          this.suggest_forbid('delete')
          break
      }
    },
    suggest_forbid (actionType) {
      this.forbiding({type: actionType, creator: this.detail.creator.id, name: this.detail.creator.name, moduleId: this.detail.moduleId, suggestionId: this.detail.sid})
    },
    forbiding (op) {
      var that = this
      if (op.type == 'add') {
        this.forbidName = op.name
        this.forbidUid = op.creator
        this.moduleId = op.moduleId
        this.suggestionId = op.suggestionId
        this.dialogVisible = true
      } else {
        this.$http({
          method: 'post',
          url: 'user/black/delete',
          data: {
            uid: op.creator,
            moduleId: this.detail.moduleId,
            creator: that.$store.state.loginUser
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('解除禁言成功')
            that.dialogVisible = false
            that.reLoadData()
            that.reLoadList()
          }
        })
      }
      console.log(op)
    },
    suggest_essence (actionType) {
      var that = this
      this.$get(`suggest/essence/${actionType}/${this.detail.sid}`).then(res => {
        if (res.code === 200) {
          Toast(`${actionType !== 'add' ? '取消置精华' : '设置精华'}成功`)
          setTimeout(() => {
            that.reLoadData()
            that.reLoadList()
          }, 500)
        }
      })
    },
    suggest_top (actionType) {
      var that = this
      this.$get(`suggest/top/${actionType}/${this.detail.sid}`).then(res => {
        if (res.code === 200) {
          Toast(`${actionType !== 'add' ? '取消置顶' : '置顶'}成功`)
          setTimeout(() => {
            that.reLoadData()
            that.reLoadList()
          }, 500)
        }
      })
    },
    suggest_delete () {
      var that = this
      MessageBox.prompt('请填写删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        this.$http({
          method: 'post',
          url: 'suggest/delete',
          data: {
            sId: this.detail.sid,
            reason: value,
            deleted: true
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            setTimeout(() => {
              that.$router.go(-1)
            })
          }
          console.log(res)
        })
      })
    },
    submitForm () {
      var that = this
      this.$refs.forbidFormDetail.validate(valid => {
        if (!valid) return false
        axios.post(this.baseURL + 'user/black/add', {
          uid: this.forbidUid,
          userType: 1,
          creator: that.$store.state.loginUser,
          creatorType: 1,
          moduleId: this.detail.moduleId,
          suggestionId: this.detail.sid,
          reason: this.forbidForm.reason,
          startTime: this.GetDateStr(0),
          endTime: this.GetDateStr(Number(this.forbidForm.date))
        }, {headers: {'Content-Type': 'application/json'}})
          .then(res => {
            if (res.data.code === 200) {
              Toast('禁言成功')
              that.dialogVisible = false
              that.reLoadData()
              that.reLoadList()
            }
          })
      })
    },
    thumbsUp () {
      var that = this
      axios.post(that.baseURL + `like/${this.detail.like ? 'cancel' : 'add'}`, {creator: that.$store.state.loginUser, creatorType: 1, suggestionId: this.detail.sid}, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            that.thumbsUpDisabled = false
            if (that.detail.like) {
              that.detail.likeCount -= 1
            } else {
              that.detail.likeCount += 1
            }
            that.detail.like = !that.detail.like
          }
        })
      this.thumbsUpDisabled = true
    },
    loadMore () {
      var that = this
      this.requestData(this.current, 5).then(res => {
        if (res.pages <= res.current) {
          that.isLoaded = true
        }
        that.records = [...that.records, ...res.records]
        that.current += 1
      })
    },
    toReply () {
      this.$router.push({path: './reply', query: {id: this.$route.query.id}})
    },
    requestData (current, size) {
      var that = this
      return new Promise(resolve => {
        this.$http({
          method: 'post',
          url: 'review/list',
          data: {
            sId: this.$route.query.id,
            uid: that.$store.state.loginUser,
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
      this.$http({
        method: 'post',
        url: 'suggest/detail',
        data: {
          sId: this.$route.query.id,
          uid: that.$store.state.loginUser
        }
      }).then(res => {
        if (res.code === 200) {
          that.forbid = res.data.forbid
          that.detail = res.data
          that.forbidUid = this.detail.creator.id
          that.tabHeader.title = res.data.title
          this.tabHeader.rightBtn = {
            url: '',
            title: ''
          }
          that.$previewRefresh()
        }
      })
    },
    reLoadList () {
      var that = this
      this.requestData(1, 5).then(res => {
        that.mescroll.scrollTo(0, 0)
        that.records = []
        that.total = res.total
        that.records = res.records
        that.current = 1
        that.mescroll.setPageNum(2)
        that.mescroll.endSuccess(res.records.length)
      })
    }
  },
  created () {
    this.$store.state.headerZindex = 0
    this.userId = this.$store.state.loginUser
    var that = this
    this.$http({
      method: 'post',
      url: 'suggest/skim',
      data: {
        sid: this.$route.query.id,
        uid: that.$store.state.loginUser,
        userType: 1
      }
    }).then(res => {

    })
    this.reLoadData()
  }
}
</script>

<style scoped lang="scss">
  .detail{
    .mescroll {
      z-index: 9;
      position: fixed;
      top: 40px;
      bottom: 0;
      width: 800px;
      height: calc(100% - 80px);
    }
    .is-selected{
      border-bottom-color: $thmeFontColor;
      color: $thmeFontColor;
    }
    padding-top: 2.5rem;
    box-sizing: border-box;
    /*height: calc(100% - 2.5rem);*/
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
          display: block;
          img{
            width: 100%;
            height: auto;
          }
        }
      }
      .footer{
        box-sizing: border-box;
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
