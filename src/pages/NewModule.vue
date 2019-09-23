<template>
    <div class="newModule" style="width: 800px;margin: 0 auto">
      <div class="cont">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="选择类别">
            <el-select size="mini" v-model="form.cId" placeholder="请选择类别">
              <el-option v-for="item in cIdList" :key="item.id" size="mini" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="版块名称" size="mini">
            <el-input @submit.native.prevent min v-model.trim="form.moduleName" placeholder="最多输入10个字符"></el-input>
          </el-form-item>
          <el-form-item label="版块图标" size="mini">
            <el-upload
              accept="image/*"
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="版块描述">
            <el-input type="textarea" placeholder="请填写描述且不多于30个字符" v-model.trim="form.description"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">立即创建</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import { Toast, Indicator } from 'mint-ui'
import aioxs from 'axios'
export default {
  name: 'NewModule',
  data () {
    return {
      uploadUrl: '',
      form: {},
      cIdList: [],
      imageUrl: ''
    }
  },
  computed: {
    ...mapState(['tabHeader'])
  },
  methods: {
    onValuesChange (picker, values) {
      if (values[0] > values[1]) {
        picker.setSlotValue(1, values[0])
      }
    },
    beforeAvatarUpload () {
      Indicator.open('上传中...')
    },
    handleAvatarSuccess (response) {
      if (response.code === 200) {
        Indicator.close()
        this.imageUrl = response.data[0].filePath
        this.form.icon = response.data[0].fileId
      } else {
        Toast(response.message)
      }
    },
    onSubmit () {
      var that = this
      if (!this.form.cId) {
        Toast('请选择类别')
        return
      }
      if (!this.form.moduleName) {
        Toast('请填写版块名称')
        return
      }
      if (!(this.form.moduleName.length <= 10 && this.form.moduleName)) {
        Toast('版块名称不多于10个字符')
        return
      }
      if (!this.form.icon) {
        Toast('请上传图标')
        return
      }
      if (!this.form.description) {
        Toast('请填写描述')
        return
      }
      if (!(this.form.description.length <= 30 && this.form.description)) {
        Toast('描述不多于30个字符')
        return
      }
      aioxs.post(this.baseURL + '/module/add', this.form, {headers: {'Content-Type': 'application/json'}}
      ).then(res => {
        if (res.data.code === 200) {
          Toast('创建成功')
          setTimeout(function () {
            that.$store.state.indexCollectChange += 1
            that.$router.go(-1)
          }, 500)
        } else {
          Toast(res.data.message)
        }
      })
    }
  },
  mounted () {
    this.uploadUrl = this.baseURL + 'file/upload'
    this.tabHeader.title = '新建版块'
    this.tabHeader.rightBtn = {
      url: '',
      title: ''
    }
    this.form.owner = this.$store.state.loginUser
    this.form.creator = this.$store.state.loginUser
    this.form.creatorType = 1
    var that = this
    that.$get('category/list').then(res => {
      if (res.code === 200) {
        that.cIdList = res.data
      } else {
        that.Toast(res.message)
      }
    })
  }
}
</script>

<style scoped lang="scss">
  .newModule{
    padding-top: 2.5rem;
    .cont{
      padding: 1rem;
      .avatar-uploader .el-upload {
        border: 1px dashed #8c939d;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
      }
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
      }
      .avatar {
        width: 178px;
        height: 178px;
        display: block;
      }
    }
  }

</style>
