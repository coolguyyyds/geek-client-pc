<template>
  <div class='publish-page'>
    <el-card>
      <div slot="header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{$route.query.id ? '修改' : '发布'}}文章</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 表单 -->
      <el-form ref="articleForm" label-width="120px" :rules="articleRules" :model="articleForm">
        <el-form-item label="标题：" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" style="width:400px"></el-input>
        </el-form-item>
        <el-form-item label="频道：" prop="channel_id">
          <my-channel v-model="articleForm.channel_id"></my-channel>
        </el-form-item>
        <el-form-item label="封面：" prop="cover">
          <el-radio-group v-model="articleForm.cover.type" @change="changeCoverType">
            <el-radio :label="1">单图</el-radio>
            <el-radio :label="3">三图</el-radio>
            <el-radio :label="0">无图</el-radio>
            <el-radio :label="-1">自动</el-radio>
          </el-radio-group>
          <div v-if="articleForm.cover.type===1||articleForm.cover.type===3">
            <el-upload
              ref="upload"
              name="image"
              :action="`${$http.defaults.baseURL}v1_0/upload`"
              :headers="{Authorization: `Bearer ${token}`}"
              list-type="picture-card"
              :limit="articleForm.cover.type"
              :on-success="uploadSuccess"
              :on-remove="removeFile"
              :file-list="fileList"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="内容：" prop="content">
          <quillEditor v-model="articleForm.content" @blur="checkContent" :options="editorOption"></quillEditor>
        </el-form-item>
        <el-form-item label="" v-if="$route.query.id">
          <el-button @click="updateArticle(false)" type="primary" v-if="$route.query.id">修改文章</el-button>
          <el-button @click="updateArticle(true)">存入草稿</el-button>
        </el-form-item>
        <el-form-item label="" v-else>
          <el-button @click="submit(false)" type="primary">发布文章</el-button>
          <el-button @click="submit(true)">存入草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import myChannel from '../../components/my-channel.vue'
import auth from '@/utils/auth'
export default {
  components: { myChannel, quillEditor },
  name: 'PublishPage',
  created () {
    if (this.$route.query.id) {
      this.getArticle(this.$route.query.id)
    }
  },
  computed: {
    fileList () {
      return this.articleForm.cover.images.map(item => ({ name: item, url: item }))
    }
  },
  data () {
    return {
      articleForm: {
        title: null,
        content: null,
        cover: {
          type: 1,
          images: []
        },
        channel_id: null
      },
      token: auth.getToken(),
      // 富文本配置对象
      editorOption: {},
      articleRules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 4, max: 50, message: '文章标题4-50字符', trigger: 'blur' }
        ],
        cover: [
          { validator: this.checkCoverFn, trigger: 'change' }
        ],
        channel_id: [
          { required: true, message: '请选择文章频道', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    changeCoverType () {
      this.articleForm.cover.images = []
      // 判断当类型发生改变时触发该函数 无上传文件则逻辑中断有文件则利用组件方法清空上传文件
      this.$refs.upload && this.$refs.upload.clearFiles()
      // this.$refs.articleForm.validateField('cover')
    },
    uploadSuccess (response) {
      this.articleForm.cover.images.push(response.data.url)
      // cover.images是数组（引用数据类型）监测不到数组发生变化需要手动校验 所以上传图片成功时触发一次校验
      this.$refs.articleForm.validateField('cover')
    },
    removeFile (file) {
      // file 文件对象 包含删除文件的相关信息
      // 第一步找出删除的图片对应cover.images数组中的索引
      // 第二步根据索引删除cover.images数组中对应的数据
      const index = this.articleForm.cover.images.findIndex(item => item === file.response.data.url)
      this.articleForm.cover.images.splice(index, 1)
      this.$refs.articleForm.validateField('cover')
    },
    checkContent () {
      this.$refs.articleForm.validateField('content')
    },
    // 自定义校验规则
    checkCoverFn (rule, value, cb) {
      if (value.type === 1) {
        if (!value.images[0]) {
          cb(new Error('请选择一张封面'))
        }
      }
      if (value.type === 3) {
        if (!(value.images[0] && value.images[1] && value.images[2])) {
          cb(new Error('请选择三张封面图'))
        }
      }
      // callback函数传入空代表校验成功
      cb()
    },
    submit (draft) {
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          this.$http({
            method: 'POST',
            url: '/v1_0/mp/articles',
            params: {
              draft: draft
            },
            data: this.articleForm
          }).then(res => {
            this.$message.success('发表成功')
            this.$router.push('/article')
          }).catch(() => {
            this.$message.error('发布失败')
          })
        }
      })
    },
    async getArticle (id) {
      const { data } = await this.$http.get(`/v1_0/mp/articles/${id}`)
      this.articleForm = data.data
    },
    updateArticle (draft) {
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          this.$http({
            method: 'PUT',
            url: `/v1_0/mp/articles/${this.$route.query.id}`,
            params: {
              draft: draft
            },
            data: this.articleForm
          }).then(res => {
            this.$message.success('修改成功')
            this.$router.push('/article')
          }).catch(() => {
            this.$message.error('修改失败, 请稍后重试')
          })
        }
      })
    }
  },
  // 路由组件钩子
  beforeRouteUpdate (to, from, next) {
    // 地址栏参数变化，路径不变化，对应的组件不会重新初始化(因为使用的是同一组件, 同一组件切换不会重新渲染)
    if (to.query.id) {
      this.getArticle(to.query.id)
    } else {
      this.$refs.articleForm.resetFields()
    }
    next()
  }
}

</script>
<style scoped lang="less">
.el-select {
  width: 400px;
}
// 子组件样式穿透 第一种写法
::v-deep .el-upload-list__item {
  // 取消图片上传时的过渡样式
  transition: none;
}
// 子组件样式穿透 第二种写法
/deep/.ql-editor {
  min-height: 300px;
}

</style>
