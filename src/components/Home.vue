<template>
  <div class="layout">
    <el-container>
      <el-aside class="layout-left">
        <div class="logo">
          <img src="../assets/logo.png" alt="logo" class="logo_img">
          <h2 class="logo_title">Manager</h2>
        </div>
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-submenu index="1">
            <template #title>
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item index="1-1">选项1</el-menu-item>
            <el-submenu index="1-2">
              <template #title>选项2</template>
              <el-menu-item index="1-2-1">选项2-1</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <template #title>导航二</template>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <template #title>导航三</template>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <template #title>导航四</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container class="layout-right">
        <el-header></el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style lang="scss">
.layout {
  &-left {
    height: 100vh;
    overflow-y: auto;
    color: #fff;
    background: #545c64;
    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      &_img {
        width: 32px;
        height: 32px;
      }
      &_title {
        margin: 0 10px;
        line-height: 56px;
        font-size: 20px;
      }
    }
    .el-menu {
      border-color: #545c64;
    }
  }
  &-right {
    height: 100vh;
  }
}
</style>