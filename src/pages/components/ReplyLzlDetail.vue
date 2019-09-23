<template>
  <div class="forum" @click="forbiding">
    <div class="head">
      <img :src="fromUser.avatar" />
      <div class="mine">
        <h5>{{fromUser.name}}</h5>
        <p>{{createTime.slice(0,10)}}  {{createTime.slice(11,16)}}</p>
      </div>
    </div>
    <div class="content">
      <P style="white-space: pre-wrap"><span style="color: #000000">回复 {{toUser.name}}</span>：{{content}}</P>
    </div>
  </div>
</template>

<script>
export default {
  name: 'reply',
  props: ['content', 'createTime', 'fromUser', 'replyId', 'reviewId', 'toUser', 'records'],
  methods: {
    toReplyDetail () {
      this.$router.push({path: './replyDetail', query: {id: this.reviewId}})
    },
    comment (reviewId) {
      this.$router.push({path: './replyLzl', query: {reviewId: reviewId, toUid: this.creator.id}})
    },
    commentLzl (toUid, replyId) {
      this.$router.push({path: './replyLzl', query: {reviewId: this.reviewId, toUid: toUid, replyId: replyId}})
    },
    forbiding () {
      this.$emit('forbidings', this.records)
    }
  },
  data () {
    return {
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
    }
    .footer{
      padding: 0 0 0 3.5rem;
    }
  }
</style>
