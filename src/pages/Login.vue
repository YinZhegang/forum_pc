<template>
  <div class="outer">
    <div class="header">
      <h1>警务论坛
      </h1>
    </div>
    <el-input v-model="input.username" class="inp" required clearable placeholder="用户名" prefix-icon="el-icon-mobile-phone"></el-input>
    <el-input v-model="input.password" class="inp" required type="password" clearable placeholder="密码" prefix-icon="el-icon-view"></el-input>
<!--    <div class="loginDetail">-->
<!--      <el-checkbox label="自动登录" class="detail" name="type"></el-checkbox>-->
<!--      <a class="detail" href="javascript:;" @click="dialogVisible = true">忘记密码</a>-->
<!--    </div>-->
    <el-button type="primary" @click="login" class="loginBtn">登&nbsp;&nbsp;录</el-button>
    <div class="copyright">copyright©2019 北京电信易通信息技术股份有限公司出品
    </div>
    <el-dialog
      style="text-align: left"
      title="忘记密码"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <el-form ref="form" :model="comfirm" label-width="100px">
        <el-form-item label="手机或邮箱">
          <el-input v-model="comfirm.tel"></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="comfirm.comfirm" style="width: calc(100% - 75px)"></el-input>
          <el-button plain>获取</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { Toast } from 'mint-ui'
export default {
  name: '登录',
  data: function () {
    return {
      input: {
        username: '',
        password: ''
      },
      dialogVisible: false,
      comfirm: {
        tel: '',
        comfirm: ''
      }
    }
  },
  created () {
    this.$store.state.headerIf = false
  },
  beforeDestroy () {
    this.$store.state.headerIf = true
  },
  methods: {
    login () {
      var that = this
      if (this.input.username.toString().trim() === '') {
        Toast('请填写用户名')
        return
      }
      // eslint-disable-next-line eqeqeq
      if (this.input.password == '') {
        Toast('请填写密码')
        return
      }
      this.$http({
        method: 'post',
        url: 'user/login',
        data: this.input
      }).then(res => {
        if (res.code === 200) {
          localStorage.loginUser = this.input.username
          that.$store.state.loginUser = this.input.username
          Toast('登录成功')
          that.$router.push('./home')
        } else {
          Toast(res.message)
        }
      }).catch(err => {
        Toast(err)
      })
    }
  },
  mounted () {
    document.querySelector('html').style.height = 'auto'
  },
  destroyed () {
    document.querySelector('html').style.height = '100%'
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .outer{
    width: 380px;
    margin: 0 auto;
    text-align: center;
    .header{
      margin-top: 200px;
      height: 100px;
      h1{
        display: inline-block;
        font-size: 30px;
      }
    }
    .inp{
      margin-top: 30px;
      width: 100%;
    }
    .loginDetail{
      text-align: left;
      .detail{
        margin-top: 10px;
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
      }
      a{
        color: #409EFF;
        float: right;
      }
    }
    .loginBtn{
      width: 100%;
      margin-top: 40px;
    }
    .copyright{
      margin-top: 80px;
      font-size: .9em;
      color: #898989;
    }
  }
</style>
