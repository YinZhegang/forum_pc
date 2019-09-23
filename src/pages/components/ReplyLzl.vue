<template>
    <div class="lzl">
      <mt-actionsheet
        :actions="actions"
        v-model="sheetVisible">
      </mt-actionsheet>
      <div class="cont" v-if="replies.total">
        <p style="white-space: pre-wrap;">
          <span v-for="item in replies.records" :style="{color:item.fromUser.owner?'#26a2ff':'#000000' }" @click="commentLzl(item)">{{item.fromUser.name}} 回复 {{item.toUser.name}}：{{item.content}}</br></span>
         </p>
        <div v-if="replies.total>5" @click="toDetail">还有{{replies.total-5}}条回复，点击查看更多....</div>
      </div>
      <div class="footer">
        <div @click="comment">
          <icon name="comments" scale="1.4"  class="icon" style="margin-right: 1rem"></icon>
        </div>
        <div  @click="thumbsUp" :style="{color:like?'red':'#757575'}">
          <icon name="thumbs-up" scale="1.4"  class="icon" :style="{marginRight:' .2rem',color:like?'red':'#757575'}"></icon><span style="margin-top: .6rem">{{likeCount}}</span></div>
        </div>
      </div>
</template>

<script>
import axios from 'axios'
import { Toast } from 'mint-ui'
import { MessageBox } from 'element-ui'
export default {
  name: 'Reply_lzl',
  data () {
    return {
      actions: [],
      timeOutEvent: 0,
      sheetVisible: false,
      dialogVisible: false,
      forbidForm: {
        date: '7',
        reason: '禁言原因'
      }
    }
  },
  props: ['replies', 'reviewId', 'likeCount', 'like', 'moduleId', 'mouduleOwn', 'forbid'],
  methods: {
    thumbsUp () {
      if (this.$route.path !== '/detail') {
        return
      }
      console.log(this.$route)
      var that = this
      axios.post(that.baseURL + `like/${this.like ? 'cancel' : 'add'}`, {creator: that.$store.state.loginUser, creatorType: 1, reviewId: this.reviewId}, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            if (that.like) {
              that.likeCount -= 1
            } else {
              that.likeCount += 1
            }
            that.like = !that.like
          }
        })
    },
    toEdit (item) {
      this.$router.push({path: './replyLzl', query: {moduleId: this.moduleId, replyId: item.replyId}})
    },
    comment () {
      if (this.forbid) return
      this.$emit('comment')
    },
    suggest_delete (item) {
      var that = this

      MessageBox.prompt('请填写删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        that.$http({
          method: 'post',
          url: 'reply/delete',
          data: {
            replyId: item.replyId,
            reason: value
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            that.$emit('reloadPageLzl')
          }
        })
      })
    },
    commentLzl (item) {
      if (this.$store.state.loginUser == item.fromUser.id) {
        if (this.forbid) {
          this.actions = [
            // {name: '编辑', method: this.toReply.bind(this, item)},
            {name: '删除', method: this.suggest_delete.bind(this, item)}
          ]
        } else {
          this.actions = [
            {name: '回复', method: this.toReply.bind(this, item)},
            {name: '编辑', method: this.toEdit.bind(this, item)},
            {name: '删除', method: this.suggest_delete.bind(this, item)}
          ]
        }
        this.sheetVisible = true
      } else {
        if (this.mouduleOwn) {
          this.actions = [
            {name: '删除', method: this.suggest_delete.bind(this, item)},
            {name: '回复', method: this.toReply.bind(this, item)}
          ]
          let a = {}
          if (!item.fromUser.forbid) {
            a.name = '禁言'
            a.method = this.suggest_forbid_add.bind(this, item)
          } else {
            a.name = '取消禁言'
            a.method = this.suggest_forbid_delete.bind(this, item)
          }
          this.actions.push(a)
          console.log(this.actions)
          this.sheetVisible = true
        } else {
          if (!this.forbid) {
            this.actions = [
              {name: '回复', method: this.toReply.bind(this, item)}
            ]
            this.sheetVisible = true
          }
        }
      }
      // this.$emit('commentLzl', toUid, replyId)
    },
    suggest_forbid (actionType, item) {
      var that = this
      if (actionType == 'add') {
        // this.suggestionId = op.suggestionId
        // this.dialogVisible = true
        that.$emit('openForbid', {forbidName: item.fromUser.name, uid: item.fromUser.id})
      } else {
        this.$http({
          method: 'post',
          url: 'user/black/delete',
          data: {
            uid: item.fromUser.id,
            moduleId: that.moduleId,
            creator: that.$store.state.loginUser
          }
        }).then(res => {
          if (res.code == 200) {
            Toast('解除禁言成功')
            that.$emit('reloadPageLzl')
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
    toReply (item) {
      this.$emit('commentLzl', item.fromUser.id, item.replyId)
    },
    toDetail () {
      this.$emit('toDetail')
    },
    suggest_forbid_add (item) {
      this.suggest_forbid('add', item)
    },
    suggest_forbid_delete (item) {
      this.suggest_forbid('delete', item)
    }
  }
}
</script>

<style scoped lang="scss">
.lzl{
  margin-top: .7rem;
  box-sizing: border-box;
  .cont{
    padding: .6rem;
    background-color: #f6f6f6;
    border-radius: 6px;
  }
  .footer{
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    .icon{
     color: #757575;
      margin-top: .5rem;
      cursor: pointer;
    }
  }
}
</style>
