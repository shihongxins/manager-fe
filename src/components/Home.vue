<template>
  <div class="layout">
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside
        class="layout-left"
        :width="''"
        :class="{ collapsed: menuCollapsed }"
      >
        <div class="logo">
          <img src="../assets/logo.png" alt="logo" class="logo_img" />
          <h2 class="logo_title">Manager</h2>
        </div>
        <!-- 使用自定义封装的递归树形菜单（菜单容器无需递归） -->
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="menuCollapsed"
          router
        >
          <TreeMenu :menuList="menuList" />
        </el-menu>
      </el-aside>
      <!-- 右边内容区 -->
      <el-container class="layout-right">
        <!-- 头部 -->
        <el-header>
          <div class="header_container">
            <div class="header-left">
              <!-- 侧边栏伸缩按钮 -->
              <el-button
                type="text"
                class="menu_btn"
                @click="handleMenuFoldClick"
              >
                <i
                  :class="menuCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
                ></i>
              </el-button>
              <!-- 面包屑导航 -->
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item
                  v-for="route in breadCrumb"
                  :key="route.name"
                  :to="{ path: route.path }"
                  >{{ route.meta.title }}</el-breadcrumb-item
                >
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <!-- 通知 -->
              <div class="notice">
                <el-badge
                  :is-dot="!!noticeCount"
                  type="danger"
                  @click="$router.push('/apply/audit')">
                  <i class="el-icon-bell"></i>
                </el-badge>
              </div>
              <!-- 用户功能区 -->
              <el-dropdown class="user" @command="handleUserCommand">
                <el-avatar class="user_avatar">
                  {{loginUser.userName}}
                </el-avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="loginUserDetail"
                      >个人信息</el-dropdown-item
                    >
                    <el-dropdown-item command="logout" divided
                      >退出</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        <!-- 主内容区 -->
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
        <el-dialog
          v-model="showUserInfoDialog"
          :width="300"
          :before-close="() => {showUserInfoDialog = false}">
          <el-descriptions title="个人信息" column="1">
            <el-descriptions-item label="用户名">{{loginUser.userName}}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{loginUser.job}}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{loginUser.userEmail}}</el-descriptions-item>
            <el-descriptions-item label="手机">{{loginUser.mobile}}</el-descriptions-item>
            <el-descriptions-item label="系统身份">
              {{loginUser.role == 1 ? '管理员' : '普通用户'}}
            </el-descriptions-item>
          </el-descriptions>
        </el-dialog>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex';
// 引入自定义封装的递归树形菜单
import TreeMenu from './TreeMenu.vue';

export default {
  name: 'Home',
  components: {
    TreeMenu,
  },
  data() {
    return {
      menuCollapsed: false,
      showUserInfoDialog: false,
    };
  },
  computed: {
    ...mapState({
      noticeCount: 'noticeCount',
      loginUser: 'userInfo',
      menuList: 'permissionMenuList',
    }),
    breadCrumb() {
      return this.$route.matched || [];
    },
  },
  mounted() {
    // 刷新通知提示徽章
    this.$api.getNoticeCount();
  },
  methods: {
    handleMenuFoldClick() {
      this.menuCollapsed = !this.menuCollapsed;
    },
    handleUserCommand(command) {
      if (command === 'logout') {
        this.$store.commit('logout');
        this.$router.push({ name: 'Login' });
      }
      if (command === 'loginUserDetail') {
        this.showUserInfoDialog = true;
      }
    },
  },
};
</script>

<style lang="scss">
.layout {
  &-left {
    width: 200px;
    height: 100vh;
    overflow: hidden auto !important;
    color: #fff;
    background: #545c64;
    transition: width 0.5s;
    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 56px;
      &_img {
        width: 32px;
        height: 32px;
      }
      &_title {
        margin: 0 10px;
        font-size: 20px;
      }
    }
    .el-menu {
      border-color: #545c64;
    }
    // 侧边栏折叠时
    &.collapsed {
      width: 65px;
      .logo_title {
        display: none;
      }
    }
  }
  &-right {
    height: 100vh;
    .main {
      background: #eee;
    }
    .header_container {
      height: 100%;
      display: flex;
      justify-content: space-between;
      .header-left {
        display: flex;
        align-items: center;
        .menu_btn {
          padding-right: 20px;
          font-size: 20px;
          color: #333;
        }
      }
      .header-right {
        display: flex;
        align-items: center;
        .notice {
          padding: 12px 20px;
          cursor: pointer;
          :hover {
            font-weight: bold;
          }
        }
        .user {
          &_avatar {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
