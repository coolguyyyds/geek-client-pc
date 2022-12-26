<template>
  <div class="container">
    <el-card>
      <img class="logo" src="@/assets/login-logo.png" alt="">
      <!-- 表单 -->
      <el-form ref="loginForm" :rules="rules" :model="form">
        <el-form-item prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox :value="true">我已阅读并同意「用户协议」和「隐私条款」</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button @click="loginBtn" type="primary">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import auth from '@/utils/auth'
export default {
  name: 'Login',
  data () {
    return {
      form: {
        mobile: '13200000000',
        code: '246810'
      },
      rules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: this.checkMobile, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '请输入6个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 自定义校验规则
    checkMobile (rule, value, callback) {
      if (/^1[3-9]\d{9}$/.test(value)) {
        callback()
      } else {
        callback(new Error('手机号格式不对'))
      }
    },
    loginBtn () {
      this.$refs.loginForm.validate(async valid => {
        try {
          const { data } = await this.$http.post('/v1_0/authorizations', this.form)
          auth.setToken(data.data.token)
          this.$router.push('/')
        } catch (err) {
          console.log(err)
          this.$message.error(err.response.data.message || '登录失败')
        }
      })
    }
  }
}
</script>
<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: url(../../assets/login-bg.png);
  background-size: cover;
  .el-card {
    width: 440px;
    height: 380px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 50px rgba(0,0,0,0.1);
    .logo {
      width: 200px;
      display: block;
      margin: 0 auto 20px;
    }
    .el-form {
      padding: 0 20px;
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
