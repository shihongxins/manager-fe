<template>
  <div class="login_wrapper">
    <div class="login_container">
      <h2 class="login_title">员工后台管理系统</h2>
      <el-form
        ref="loginForm"
        label-width="4em"
        :model="userInfo"
        :rules="rules"
        status-icon>
        <el-form-item label="账号" prop="userName">
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="el-icon-lock"
            v-model="userInfo.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="userPwd">
          <el-input
            type="password"
            autocomplete="off"
            prefix-icon="el-icon-key"
            show-password
            v-model="userInfo.userPwd"></el-input>
        </el-form-item>
        <el-form-item class="login_button_container">
          <el-button
            type="primary"
            :loading="onLogin"
            @click="login">登录</el-button>
          <el-button type="text">忘记密码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      onLogin: false,
      userInfo: {
        userName: '',
        userPwd: '',
      },
      rules: {
        userName: { required: true, message: '用户账号不能为空', trigger: 'blur' },
        userPwd: { required: true, message: '用户密码不能为空', trigger: 'blur' },
      },
    };
  },
  inject: ['$api'],
  methods: {
    login() {
      this.onLogin = true;
      // 再次进行表单验证
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          // 验证通过，调用根实例上挂载的 api 集合方法
          const loginUser = await this.$api.login(this.userInfo.userName, this.userInfo.userPwd);
          if (loginUser && loginUser.userName) {
            // 保存用户信息
            this.$store.commit('saveUserInfo', loginUser);
            // 根据已登录用户信息去加载权限菜单
            await this.$api.getPermissionList();
            // 跳转到首页
            this.$router.push({ name: 'Home' });
          } else {
            this.$message.error('登录失败！');
          }
        }
        this.onLogin = false;
      });
    },
  },
};
</script>

<style lang="scss">
.login_wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login_container {
    border-radius: 4px;
    padding: 50px;
    width: 350px;
    background: #fff;
    box-shadow: 0 0 4px 2px rgba(0,0,0,0.1);
    .login_title {
      margin: 0 0 30px;
      line-height: 1.5;
      font-size: 30px;
      text-align: center;
    }
  }
}
</style>
