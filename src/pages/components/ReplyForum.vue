<template>
  <div class="forum">
    <div v-if="!isLike" class="content" style="padding:10px 0;word-wrap:break-word;white-space: pre-wrap">
      {{content}}
    </div>
    <div v-if="suggestion" class="suggestion" style="background-color:#f7f7f7;padding: 10px">
      <div class="head">
        <img :src="suggestion.creator.avatar" />
        <div class="mine">
          <h5 :style="{display: 'inline-block',color:suggestion.owner?'#26a2ff':'#000000' }">{{suggestion.creator.name}}</h5><i v-if="suggestion.owner" style="color: #26a2ff;margin-left: 5px" class="el-icon-s-custom"></i>
          <p>{{suggestion.createTime.slice(0,10)}}  {{suggestion.createTime.slice(11,16)}}</p>
        </div>
      </div>
      <div class="content" @click="toDetail">
        <h4 :style="{display: 'inline-block',color:suggestion.owner?'#26a2ff':'#000000'}">{{suggestion.title}}</h4>
        <mt-badge  v-if="suggestion.top!=0" size="small" style="display: inline-block;margin-left: .4rem;color: red;border: 1px solid red" color="#fff">&nbsp;置&nbsp;顶&nbsp; </mt-badge>
        <mt-badge  v-if="suggestion.essence!=0" size="small" style="display: inline-block;margin-left: .4rem;color: #26a2ff;border: 1px solid #26a2ff" color="#fff">&nbsp;精&nbsp;华&nbsp; </mt-badge>
        <P style="white-space: pre-wrap">{{suggestion.content}}</P>
        <div class="img3" v-if="suggestion.files!=null?(suggestion.files.length>=3):false">
          <img  :src="suggestion.files[0].filePath" />
          <img  :src="suggestion.files[1].filePath" />
          <img  :src="suggestion.files[2].filePath" />
        </div>
        <div class="img2" v-else-if="suggestion.files!=null?(suggestion.files.length==2):false">
          <img  :src="suggestion.files[0].filePath" />
          <img  :src="suggestion.files[1].filePath" />
        </div>
        <div class="img1" v-else-if="suggestion.files!=null?(suggestion.files.length==1):false">
          <img  :src="suggestion.files[0].filePath" />
        </div>
      </div>
      <div class="footer">
        <div v-if="type?false:true" class="footMutil">
          <div>
            <icon name="eye" class="icon"></icon><span>{{suggestion.skimCount}}</span>
          </div>
          <div>
            <icon name="share-alt"  class="icon"></icon><span>{{suggestion.shareCount}}</span>
          </div>
          <div>
            <icon name="comments"  class="icon"></icon><span>{{suggestion.reviewCount}}</span>
          </div>
          <div>
            <icon name="thumbs-up"  class="icon" :style="{color:(suggestion.like?'red':'#409EFF')}"></icon><span>{{suggestion.likeCount}}</span>
          </div>
        </div>
      </div>
    </div>
    <div  v-if="suggestion" style="height: 20px;padding-top: 5px">
      <div v-if="isLike" class="footer">
        <p style="width: 40%;text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;">发布于 {{suggestion.moduleName}}</p>
        <div class="footMutil">
          <div>
            <icon name="eye" class="icon"></icon><span>{{suggestion.skimCount}}</span>
          </div>
          <div>
            <icon name="share-alt"  class="icon"></icon><span>{{suggestion.shareCount}}</span>
          </div>
          <div>
            <icon name="comments"  class="icon"></icon><span>{{suggestion.reviewCount}}</span>
          </div>
          <div>
            <icon name="thumbs-up"  class="icon" :style="{color:(like?'red':'#409EFF')}"></icon><span>{{suggestion.likeCount}}</span>
          </div>
        </div>
      </div>
      <div v-else>
        <p style="float: left;width: 40%;text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;">发布于 {{suggestion.moduleName}}</p>    <p style="float: right;font-size: .8rem;">{{createTime.slice(0,10)}}  {{createTime.slice(11,16)}}</p>
      </div>
    </div>
    <div v-if="review">
      <Reply style="background-color:#f7f7f7" :reviewId="review.reviewId" :creator="review.creator" :content="review.content" :type="type" :creatTime="review.creatTime" :files="review.files" :replies="review.replies"></Reply>
      <div v-if="isLike" class="footer">
        <p>发布于 {{review.moduleName}}</p>
        <div class="footMutil">
          <div>
            <icon name="comments"  class="icon"></icon><span>{{review.replyCount}}</span>
          </div>
          <div>
            <icon name="thumbs-up"  class="icon" :style="{color:(like?'red':'#409EFF')}"></icon><span>{{review.likeCount}}</span>
          </div>
        </div>
      </div>
      <div v-else style="height: 20px;background: #fff;padding-top: 5px">
        <p style="float: left;width: 40%;text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;">发布于 {{review.moduleName}}</p>
        <p style="float: right;font-size: .8rem;">{{createTime.slice(0,10)}}  {{createTime.slice(11,16)}}</p>
      </div>
    </div>
    <div v-if="reply" @click="goReviewDetail">
      <ReplyLzlDetail style="background-color:#f7f7f7"  :content="reply!=null&&reply.content" :createTime="reply.createTime" :fromUser="reply.fromUser" :replyId="reply.replyId" :reviewId="reply.reviewId" :toUser="reply.toUser"></ReplyLzlDetail>
      <div style="height: 20px;background: #fff;padding-top: 5px">
        <p style="float: left;width: 40%;text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;">发布于 {{reply.moduleName}}</p>    <p style="float: right;font-size: .8rem;">{{createTime.slice(0,10)}}  {{createTime.slice(11,16)}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import jinhui from '@/assets/jinhui.png'
import Reply from './Reply'
import ReplyLzlDetail from './ReplyLzlDetail'
export default {
  name: 'Forum',
  // eslint-disable-next-line vue/no-dupe-keys
  props: ['content', 'review', 'reply', 'suggestion', 'type', 'moduleName', 'createTime', 'isLike'],
  components: {Reply, ReplyLzlDetail},
  data () {
    return {
      popupVisible: false,
      jinhui,
      userId: ''
    }
  },
  computed: {
    file () {
      return this.files ? this.files : []
    }
  },
  mounted () {

  },
  methods: {
    goReviewDetail () {
      this.$router.push({path: './replyDetail', query: {reviewId: this.reply.reviewId}})
    },
    toDetail () {
      this.userId = this.$store.state.loginUser
      this.$router.push({path: './detail', query: {id: this.suggestion.sid}})
    }
  }

}
</script>

<style scoped lang="scss">
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
  .forum{
    box-sizing: border-box;
    padding: .6rem .8rem;
    border-bottom: 1px solid $borderColor;
    position: relative;
    .popup{
      position: absolute;
      background: #ffffff;
      border-radius: 5px;
      border: 1px solid $borderColor;
      width: 3rem;
      right: 0.8rem;
      top: 3.3rem;
      min-width: 4rem;
      text-align: center;
      box-shadow: 2px 2px 3px rgba(0,0,0,.5);
      ul{
        list-style-type: none;
        padding: .4rem;
        line-height: 1.8rem;
        li{
          cursor: pointer;
          border-bottom: 1px solid $borderColor;
        }
      }
    }
    .head{
      .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
      }
      .el-icon-arrow-down {
        font-size: 12px;
      }
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
      .img3{
        z-index: 999;
        margin-top: .4rem;
        box-sizing: border-box;
        /*max-height: 6rem;*/
        overflow: hidden;
        img{
          width: 32.3%;
        }
      }
      .img2{
        z-index: 999;
        margin-top: .4rem;
        box-sizing: border-box;
        align-items: start;
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
          display: inline-block;
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
</style>
