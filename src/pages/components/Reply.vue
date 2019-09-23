<template>
  <div class="forum">
    <el-dialog
      style="z-index: 9999"
      :title="'禁言：'+ forbidName"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <el-form label-position="top" ref="forbidForm" :model="forbidForm" label-width="80px">
        <el-form-item label="禁言时间" size="mini">
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
        <el-form-item label="禁言原因" size="mini">
          <el-form-item>
            <el-input  :rows="3" type="textarea" maxlength="15" v-model="forbidForm.reason"></el-input>
          </el-form-item>
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
    <div class="head">
      <img :src="creator.avatar" />
      <div class="mine">
        <h5 :style="{color:creator.owner?'#26a2ff':'#000000'}">{{creator.name}}<i v-if="creator.owner" style="color: #26a2ff;margin-left: 5px;display: inline-block" class="el-icon-s-custom"></i></h5>
        <p>{{creatTime.slice(0,10)}}  {{creatTime.slice(11,16)}}</p>
      </div>
    </div>
    <div class="content" @click="toReplyDetail">
      <P style="white-space: pre-wrap">{{content}}</P>
      <div class="img">
        <div class="img3" v-if="files!=null&&files.length>=3">
          <img  :src="files[0].filePath">
          <img  :src="files[1].filePath">
          <img  :src="files[2].filePath">
        </div>
        <div class="img2" v-else-if="files!=null&&files.length==2">
          <img  :src="files[0].filePath">
          <img  :src="files[1].filePath">
        </div>
        <div class="img1" v-else-if="files!=null&&files.length==1">
          <img  :src="files[0].filePath">
        </div>
      </div>
    </div>
    <div class="footer" v-if="!type">
      <reply-lzl @toDetail="toReplyDetailMore" @reloadPageLzl="reloadPage" @openForbid="openForbid" :forbid="forbid" :mouduleOwn="mouduleOwn" :moduleId="moduleId" :reviewId="reviewId" :like="like"  :likeCount="likeCount" :replies="replies" @comment="comment(reviewId)" @commentLzl="commentLzl"></reply-lzl>
    </div>
  </div>
</template>

<script>
import ReplyLzl from './ReplyLzl'
import axios from 'axios'
import { Toast } from 'mint-ui'
import { MessageBox } from 'element-ui'
export default {
  name: 'reply',
  props: ['content', 'creatTime', 'files', 'creator', 'replies', 'reviewId', 'likeCount', 'like', 'type', 'mouduleOwn', 'moduleId', 'moduleName', 'forbid'],
  components: {ReplyLzl},
  data () {
    return {
      forbidName: '',
      actions: [],
      sheetVisible: false,
      dialogVisible: false,
      forbidForm: {}
    }
  },
  methods: {
    reloadPage () {
      this.$emit('reloadPage')
    },
    openForbid (data) {
      this.$emit('openForbid', data)
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
      console.log(this.creator)
      axios.post(this.baseURL + 'user/black/add', {
        uid: that.creator.id,
        userType: 1,
        creator: that.$store.state.loginUser,
        creatorType: 1,
        moduleId: this.moduleId,
        reason: this.forbidForm.reason,
        suggestionId: this.$route.query.id,
        startTime: this.GetDateStr(0),
        endTime: this.GetDateStr(Number(this.forbidForm.date))
      }, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            Toast('禁言成功')
            that.dialogVisible = false
          }
        })
    },
    suggest_forbid_add () {
      this.suggest_forbid('add')
    },
    suggest_forbid_delete () {
      this.suggest_forbid('delete')
    },
    toReplyDetailMore () {
      this.$router.push({path: './replyDetail', query: {reviewId: this.reviewId, moduleId: this.moduleId}})
    },
    toEdit () {
      this.$router.push({path: './reply', query: {moduleId: this.moduleId, reviewId: this.reviewId, id: this.$route.query.id}})
    },
    toReplyDetail () {
      if (!this.type) {
        if (this.$store.state.loginUser == this.creator.id) {
          if (this.forbid) {
            this.actions = [
              {name: '删除', method: this.suggest_delete}
            ]
          } else {
            this.actions = [
              {name: '回复', method: this.comment.bind(this, this.reviewId)},
              {name: '编辑', method: this.toEdit},
              {name: '删除', method: this.suggest_delete}
            ]
          }
          this.sheetVisible = true
        } else {
          if (this.mouduleOwn) {
            this.actions = [
              {name: '回复', method: this.comment.bind(this, this.reviewId)},
              {name: '删除', method: this.suggest_delete},
              {name: !this.creator.forbid ? '禁言' : '取消禁言', method: !this.creator.forbid ? this.suggest_forbid_add : this.suggest_forbid_delete}
            ]
            this.sheetVisible = true
          } else {
            if (!this.forbid) {
              this.actions = [
                {name: '回复', method: this.comment.bind(this, this.reviewId)}
              ]
              this.sheetVisible = true
            }
          }
        }
        return
      }
      this.$router.push({path: './replyDetail', query: {reviewId: this.reviewId}})
    },
    suggest_forbid (actionType) {
      var that = this
      if (actionType == 'add') {
        this.forbidName = this.creator.name
        // this.moduleId = op.moduleId
        // this.suggestionId = op.suggestionId
        // this.dialogVisible = true
        that.$emit('openForbid', {forbidName: this.creator.name, uid: that.creator.id})
      } else {
        this.$http({
          method: 'post',
          url: 'user/black/delete',
          data: {
            uid: that.creator.id,
            moduleId: that.moduleId,
            creator: that.$store.state.loginUser
          }
        }).then(res => {
          if (res.code == 200) {
            Toast('解除禁言成功')
            that.reloadPage()
          }
        })
      }
    },
    suggest_delete () {
      var that = this
      MessageBox.prompt('请填写删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        that.$http({
          method: 'post',
          url: 'review/delete',
          data: {
            reviewId: that.reviewId,
            reason: value
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            that.$emit('reloadPage')
          }
        })
      })
    },
    comment (reviewId) {
      this.$router.push({path: './replyLzl', query: {reviewId: reviewId, toUid: this.creator.id}})
    },
    commentLzl (toUid, replyId) {
      this.$router.push({path: './replyLzl', query: {reviewId: this.reviewId, toUid: toUid}})
    }
  }
}
</script>

<style scoped lang="scss">
  $fontSubColor: #757575;
  .forum{
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
          color: $fontSubColor;
        }
      }
    }
    .content{
      padding: 0 0 0 3.5rem;
      h4{
        margin-top: .2rem;
        box-sizing: border-box;
      }
      P{
        margin-top: .3rem;
        box-sizing: border-box;
        color: $fontSubColor;
        line-height: 1.4rem;
      }
      .img3{
        z-index: 999;
        margin-top: .4rem;
        /*max-height: 6rem;*/
        overflow: hidden;
        img{
          width: 32%;
        }
      }
      .img2{
        z-index: 999;
        margin-top: .4rem;
        box-sizing: border-box;
        /*max-height: 6rem;*/
        overflow: hidden;
        img{
          width: 49%;
        }
      }
      .img1{
        z-index: 999;
        margin-top: .4rem;
        box-sizing: border-box;
        /*max-height: 6rem;*/
        overflow: hidden;
        img{
          width: 100%;
        }
      }
    }
    .footer{
      padding: 0 0 0 3.5rem;
    }
  }
</style>
