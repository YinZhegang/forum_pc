<template>
  <div class="post" style="width: 800px;margin: 0 auto">
    <div class="input">
      <el-form ref="form" :model="form" >
        <el-form-item>
          <el-input placeholder="回复"  :rows="7" type="textarea" v-model="form.content"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import { Toast } from 'mint-ui'
export default {
  name: 'ReplyLzl',
  data () {
    return {
      isUploaded: true,
      form: {
      },
      myText: '',
      title: '',
      imgLoad: null,
      formdata: null
    }
  },
  methods: {
    onSubmit () {
      var that = this
      if (!this.form.content) {
        Toast('请填写内容')
        return
      }
      if (this.trim(this.form.content).length == 0) {
        Toast('请填写内容')
        return
      }
      if (this.trim(this.form.content).length > 500) {
        Toast('内容不得超过500字')
        return
      }
      if (this.$route.query.replyId) {
        that.$post('reply/update', {
          replyId: this.$route.query.replyId,
          content: this.form.content
        }
        ).then(res => {
          if (res.code === 200) {
            Toast('修改回复成功')
            setTimeout(function () {
              that.$router.back(-1)
            }, 500)
          } else {
            Toast(res.message)
          }
        })
      } else {
        this.form.fromUserType = 1
        this.form.toUserType = 1
        this.form.reviewId = this.$route.query.reviewId
        this.form.toUid = this.$route.query.toUid
        this.form.fromUid = that.$store.state.loginUser
        axios.post(this.baseURL + 'reply/add', this.form, {headers: {'Content-Type': 'application/json'}}
        ).then(res => {
          if (res.data.code === 200) {
            Toast('回复成功')
            setTimeout(function () {
              that.$router.back(-1)
            }, 500)
          } else {
            Toast(res.data.message)
          }
        })
      }
    },
    onInput (event) {
      // event.data contains the value of the textarea
    },
    clearTextarea () {
      this.$refs.emoji.clear()
    }
  },
  watch: {
    eventTrigger (n, o) {
      this.onSubmit()
    }
  },
  mounted () {
    var that = this
    this.tabHeader.title = '回复'
    this.tabHeader.rightBtn = {
      url: '',
      title: '发布'
    }
    if (this.$route.query.replyId) {
      this.$http({
        method: 'post',
        url: 'reply/info',
        data: {
          id: this.$route.query.replyId
        }
      }).then(res => {
        // that.paperLoaded()
        if (res.code == 200) {
          that.form = res.data
        }
      })
    }
  },
  computed: {
    ...mapState(['tabHeader', 'eventTrigger'])
  }
}
</script>

<style scoped lang="scss">
  .emoji-menu{
    position: absolute!important;
    right: -300px!important;
  }
  .post{
    padding: 3rem .6rem;
    .input{
      .emoji-picker-container{

      }
    }
  }

</style>
