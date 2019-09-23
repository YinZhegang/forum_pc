<template>
   <div class="forum">
      <div class="head">
          <img :src="creator.avatar" />
          <div class="mine">
              <h5 :style="{display: 'inline-block',color:creator.owner?'#26a2ff':'#000000' }">{{creator.name}}</h5><i v-if="creator.owner" style="color: #26a2ff;margin-left: 5px" class="el-icon-s-custom"></i>
              <p>{{createTime.slice(0,10)}}  {{createTime.slice(11,16)}}</p>
          </div>
        <div v-if="creator.id==userId||owner" v-show="isDropDown" @click="sheetVisible=true" style="float: right;position: relative;color:#757575;width: 50px;text-align: center"><i class="el-icon-more el-icon&#45;&#45;right"></i></div>
        <mt-actionsheet
          :actions="actions"
          v-model="sheetVisible">
        </mt-actionsheet>
      </div>
     <div class="content" @click.stop="toDetail">
        <p class="titles" :style="{display: 'inline-block',color:creator.owner?'#26a2ff':'#000000'}">{{title}}</p>
       <span v-if="isDropDown">
          <mt-badge  v-if="top!=0" size="small" style="display: inline-block;margin-left: .4rem;color: red;border: 1px solid red" color="#fff">&nbsp;置&nbsp;顶&nbsp; </mt-badge>
          <mt-badge  v-if="essence!=0" size="small" style="display: inline-block;margin-left: .4rem;color: #26a2ff;border: 1px solid #26a2ff" color="#fff">&nbsp;精&nbsp;华&nbsp; </mt-badge>
       </span>
       <P class="contDetal">{{content}}</P>
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
     <div class="footer">
          <p style="width: 40%;text-overflow:ellipsis;
    white-space: nowrap;
    font-size: .8rem;
    overflow: hidden;">发布于 {{moduleName}}</p>
          <div class="footMutil">
            <div>
              <icon name="eye" class="icon"></icon><span>{{skimCount}}</span>
            </div>
            <div>
              <icon name="share-alt"  class="icon"></icon><span>{{shareCount}}</span>
            </div>
            <div>
              <icon name="comments"  class="icon"></icon><span>{{reviewCount}}</span>
            </div>
            <div @click.stop="flag&&thumbsUp()">
              <icon name="thumbs-up"  class="icon" :style="{color:(like?'red':'#409EFF')}"></icon><span>{{likeCount}}</span>
            </div>
          </div>
     </div>
   </div>
</template>

<script>
import jinhui from '@/assets/jinhui.png'
import axios from 'axios'
import { MessageBox } from 'element-ui'
import { Toast } from 'mint-ui'
export default {
  name: 'Forum',
  // eslint-disable-next-line vue/no-dupe-keys
  props: ['content', 'title', 'creator', 'createTime', 'moduleName', 'moduleId', 'files', 'essence', 'top', 'skimCount', 'shareCount', 'reviewCount', 'likeCount', 'like', 'owner', 'sid', 'forbid', 'isDropDown', 'idx', 'type'],
  components: {MessageBox, Toast},
  data () {
    return {
      actions: null,
      dropdownIf: true,
      popupVisible: false,
      jinhui,
      userId: '',
      flag: true,
      sheetVisible: false
    }
  },
  created () {
    this.userId = this.$store.state.loginUser
    this.setSheet()
  },
  mounted () {
    var that = this
    if (this.$route.path == '/module') {
    }
  },
  methods: {
    setSheet () {
      let action = []
      if (!this.creator.forbid) {
        let edit1 = this.creator.id === this.userId ? {name: '编辑', method: this.goEdit} : ''
        if (edit1) action.push(edit1)
      }
      let edit2 = this.creator.id === this.userId || this.owner ? {name: '删除', method: this.suggest_delete} : ''
      if (edit2) action.push(edit2)
      if (this.owner) {
        let top = !this.top ? {name: '置顶', method: this.suggest_top_add} : {
          name: '取消置顶',
          method: this.suggest_top_cancel
        }
        action.push(top)
        let essence = !this.essence ? {name: '设为精华', method: this.suggest_essence_add} : {
          name: '取消精华',
          method: this.suggest_essence_cancel
        }
        action.push(essence)
        let forbid =
          this.creator.id != this.userId ? (!this.creator.forbid ? {name: '禁言', method: this.suggest_forbid_add} : {
            name: '解除禁言',
            method: this.suggest_forbid_delete
          }) : ''

        if (forbid) action.push(forbid)
      }
      this.actions = action
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
    handleCommand (command) {
      switch (command) {
        case 'suggest_delete':
          this.suggest_delete()
          break
        case 'edit':
          this.$router.push({path: './post', query: {moduleId: this.moduleId, sid: this.sid}})
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
      this.$emit('forbiding', {type: actionType, creator: this.creator.id, name: this.creator.name, moduleId: this.moduleId, suggestionId: this.sid})
    },
    suggest_essence (actionType) {
      var that = this
      this.$get(`suggest/essence/${actionType}/${this.sid}`).then(res => {
        if (res.code === 200) {
          that.$emit('reloadData', that.type).then(() => {
            that.setSheet()
          })
          Toast(`${actionType !== 'add' ? '取消置精华' : '设置精华'}成功`)
        }
      })
    },
    suggest_top (actionType) {
      var that = this
      this.$get(`suggest/top/${actionType}/${this.sid}`).then(res => {
        if (res.code === 200) {
          that.$emit('reloadData', that.type).then(() => {
            that.setSheet()
          })
          Toast(`${actionType !== 'add' ? '取消置顶' : '置顶'}成功`)
        }
      })
    },
    suggest_delete () {
      var that = this
      MessageBox.prompt('删除原因', '请填写删除原因', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9\u4e00-\u9fffa-zA-Z]{1,15}$/,
        inputErrorMessage: '请填写删除原因最多15字'
      }).then(({ value }) => {
        this.$http({
          method: 'post',
          url: 'suggest/delete',
          data: {
            sId: that.sid,
            reason: value,
            deleted: true
          }
        }).then(res => {
          if (res.code === 200) {
            Toast('删除成功')
            that.$emit('reloadData')
            setTimeout(() => {
              that.setSheet()
            }, 500)
          }
          console.log(res)
        })
      })

      // MessageBox({
      //   $type: 'prompt',
      //   title: '删除原因',
      //   message: '请填写删除原因',
      //   inputValidator: function (v) {
      //     return v != null && v.length < 10
      //   }, // function可以用来写更复杂的判断条件，返回布尔值
      //   inputErrorMessage: '请填写删除原因',
      //   showInput: true,
      //   showCancelButton: true
      // }).then(({ value, action }) => {
      //
      // })
    },
    goEdit () {
      this.$router.push({path: './post', query: {moduleId: this.moduleId, sid: this.sid}})
    },
    toDetail () {
      this.$router.push({path: './detail', query: {id: this.sid}})
    },
    thumbsUp () {
      var that = this
      this.flag = false
      axios.post(that.baseURL + `like/${that.like ? 'cancel' : 'add'}`, {creator: that.$store.state.loginUser, creatorType: 1, suggestionId: this.sid}, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
          if (res.data.code === 200) {
            that.flag = true
            if (that.like) {
              that.likeCount -= 1
            } else {
              that.likeCount += 1
            }
            that.like = !that.like
            that.$emit('changeThumbsUp', that.type, that.idx)
          }
        })
    }
  }

}
</script>

<style scoped lang="scss">
  /deep/ .el-message-box{width: 90%!important;}
  .forum{
    box-sizing: border-box;
    padding: .6rem 0;
    margin: 0 .8rem;
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
      .contDetal{
        word-break: break-all;
        white-space: pre-wrap;
      }
      .titles{
        margin-top: .2rem;
        box-sizing: border-box;
        font-weight: 600;
        word-wrap:break-word;
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
        overflow: hidden;
        img{
          width: 32%;
          height: auto;
        }
      }
      .img2{
        z-index: 999;
        margin-top: .4rem;
        box-sizing: border-box;
        overflow: hidden;
        img{
          width: 49%;
          height: auto;
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
          height: auto;
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
