<template>
  <div class="post" style="width: 800px;margin: 0 auto">
    <div class="input">
      <el-form ref="form" :model="form" >
        <el-form-item>
          <el-input placeholder="评论"  :rows="7" type="textarea" v-model="form.content"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="imgUpload">
      <div class="uploaded">
        <div v-for="item, index in form.files" class="item" >
          <i @click="delImg(index)" class="el-icon-circle-close" style="position: absolute;right: -10px;top: -5px;background-color: #f6f6f6;border-radius: 20px;z-index: 999"></i>
          <img class="uploadImg" :style="{maxWidth:itemWidth+'px',maxHeight:itemWidth+'px'}" :src='item.filePath' :preview="item.fileOrder"  />
        </div>
        <div class="plust"  v-if="form.files.length<9" :style="{width:itemWidth+'px',height:itemWidth+'px'}">
          <input accept="image/*" type="file" :disabled="!isUploaded" id="uploadfile" multiple @change="isUploaded&&previewImg($event)" style="position: absolute;width: 100%;height: 100%;left: 0;opacity: 0;z-index: 999" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import { Toast, Indicator } from 'mint-ui'
export default {
  name: 'Post',
  data () {
    return {
      itemWidth: 0,
      isUploaded: true,
      form: {
        files: []
      },
      myText: '',
      title: '',
      imgLoad: null,
      formdata: null
    }
  },
  beforeRouteLeave (to, from, next) {
    // 设置下一个路由的 meta
    Indicator.close()
    // B 跳转到 A 时，让 A 不缓存，即刷新（代码写在C页面）
    next()
  },
  methods: {
    uploadFile () {
      var that = this
      return new Promise(resolve => {
        that.formdata = new FormData()
        that.imgLoad = document.getElementById('uploadfile').files
        for (var i = 0; i < that.imgLoad.length; i++) {
          that.formdata.append('file', that.imgLoad[i])
        }
        axios({
          url: that.baseURL + 'file/upload',
          method: 'post',
          data: that.formdata,
          processData: false, // 告诉axios不要去处理发送的数据(重要参数)
          contentType: false, // 告诉axios不要去设置Content-Type请求头
          timeout: 10000
        }).then(res => {
          if (res.data.code === 200) {
            let len = that.form.files.length
            for (var i = 0; i < res.data.data.length; i++) {
              that.form.files.push({
                fileId: res.data.data[i].fileId,
                fileOrder: len + i,
                filePath: res.data.data[i].filePath
              })
              Indicator.close()
              that.isUploaded = true
              Toast('文件上传成功')
            }
          }
        }).catch(err => {
          that.isUploaded = true
          Indicator.close()
          Toast('上传超时')
        })
      })
    },
    onSubmit () {
      if (!this.isUploaded) {
        Toast('请稍等，图片未完全上传')
        return
      }
      if (!this.form.content) {
        Toast('请填写评论内容')
        return
      }
      if (this.trim(this.form.content).length == 0) {
        Toast('请填写评论内容')
        return
      }
      if (this.trim(this.form.content).length > 500) {
        Toast('评论内容不超过500字')
        return
      }
      var that = this
      this.form.creatorType = 1
      this.form.sid = this.$route.query.id
      this.form.creator = that.$store.state.loginUser
      this.form.userStr = ''
      this.form.userStr = ''
      if (this.$route.query.reviewId) {
        axios.post(this.baseURL + 'review/update', this.form, {headers: {'Content-Type': 'application/json'}}
        ).then(res => {
          if (res.data.code === 200) {
            Toast('修改评论成功')
            setTimeout(function () {
              that.$router.back(-1)
            }, 500)
          } else {
            Toast(res.data.message)
          }
        })
      } else {
        axios.post(this.baseURL + 'review/add', this.form, {headers: {'Content-Type': 'application/json'}}
        ).then(res => {
          if (res.data.code === 200) {
            Toast('评论成功')
            setTimeout(function () {
              that.$router.back(-1)
            }, 500)
          } else {
            Toast(res.data.message)
          }
        })
      }
    },
    previewImg (e) {
      if (!this.isUploaded) return
      if (!e.target.files.length) return
      if (this.form.files.length + e.target.files.length > 9) {
        Toast('最多只能上传9张图片，请重新选择')
        return
      }
      var that = this
      that.isUploaded = false
      Indicator.open('上传中...')
      this.uploadFile()
    },
    onInput (event) {
      // event.data contains the value of the textarea
    },
    delImg (index) {
      this.form.files.splice(index, 1)
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
    this.tabHeader.title = '评论'
    this.itemWidth = Math.floor(400 / 3.4)
    this.tabHeader.rightBtn = {
      url: '',
      title: '发送'
    }
    if (this.$route.query.reviewId) {
      this.$http({
        method: 'post',
        url: 'review/info',
        data: {
          id: this.$route.query.reviewId
        }
      }).then(res => {
        // that.paperLoaded()
        if (res.code == 200) {
          that.form = res.data
          let filesImg = []
          if (res.data.files != null) {
            res.data.files.forEach((item, idx) => {
              let ar = item.filePath.split('upload/images')
              filesImg.push({
                filePath: ar[0] + '/upload/images/306_306' + ar[1],
                fileId: item.id,
                fileOrder: idx
              })
            })
          }
          this.form.files = filesImg
          that.$previewRefresh()
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
    padding:3.5rem .6rem;
    .input{
      .emoji-picker-container{

      }
    }
  }
  .imgUpload{
    .uploaded{
      padding: .3rem;
      box-sizing: border-box;
      .item{
        display: inline-block;
        position: relative;
        text-align: right;
        margin: 2px
      }
      .plust{
        cursor: pointer;
        display: inline-block;
        position: relative;
        background-color: #f6f6f6;
        text-align: center;
        font-size: 2rem;
        color: #757575;
      }
      .plust::after{
        content: '+';
        position: absolute;
        top:30%;
        left: 40%;
      }
    }
  }

</style>
