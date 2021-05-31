<template>
  <template v-for="menu in menuList">
    <el-submenu
      v-if="menu.children && menu.children.length && menu.children[0].menuType == 1"
      :key="menu._id"
      :index="menu.path">
      <template #title>
        <i :class="menu.icon"></i>
        <span>{{menu.menuName}}</span>
      </template>
      <TreeMenu
        :menuList="menu.children" />
    </el-submenu>
    <el-menu-item
      v-else-if="menu.menuType == 1"
      :key="menu._id"
      :index="menu.path">{{menu.menuName}}</el-menu-item>
  </template>
</template>
<script>
export default {
  name: "TreeMenu",
  props: {
    menuList: {
      type: [Array, Object],
      default: () => []
    }
  }
}
</script>
