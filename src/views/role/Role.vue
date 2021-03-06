<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="query.roleName"
            placeholder="请输入角色名称"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuerySubmit">查询</el-button>
          <el-button @click="handleQuerySubmit({ reset: true })">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_tools">
        <el-button type="primary" @click="showDialog(true, 'add')" v-has="'role-add'">
          新增
        </el-button>
      </div>
      <div class="table_content">
        <el-table
          :data="roleList"
          stripe
        >
          <el-table-column
            v-for="col in tableColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :formatter="col.formatter"
          ></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="mini"
                @click="showDialog(true, 'edit', scope.row)"
                v-has="'role-edit'"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="primary"
                @click="showDialog(true, 'setPermission', scope.row)"
                v-has="'role-setPermission'"
                >设置权限</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
                v-has="'role-delete'"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="(pageSize) => { handleQuerySubmit({ pageSize }) }"
          @current-change="(pageNum) => { handleQuerySubmit({ pageNum }) }"
          v-model:current-page="pageData.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="pageData.pageSize"
          :total="pageData.total"
          class="table_pagination"
          layout="total, sizes, prev, pager, next, jumper"
          background
        >
        </el-pagination>
      </div>
    </div>
    <RoleOperateDialog ref="roleOperateDialog" :getRoleList="getRoleList" :menuList="menuList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref, inject,
} from 'vue';
import utils from '@/utils/utils';
import RoleOperateDialog from './components/RoleOperateDialog.vue';

/**
 * @param {Object} proxy 页面实例对象
 * @description 菜单数据表格的初始化业务逻辑（包括查询）
 */
const useRoleTableInitEffect = (proxy) => {
  // 依赖注入 $api
  const $api = inject('$api');
  // 表格展示列项
  const tableColumns = [
    {
      label: '角色名称',
      prop: 'roleName',
    },
    {
      label: '备注',
      prop: 'remark',
    },
    {
      label: '权限列表',
      prop: 'rolePermission',
      formatter(row, column, value) {
        // 深度遍历菜单，返回页面名称
        const deepMapMenu = (list = [], filter, res = []) => {
          list.forEach((menu) => {
            if (filter.indexOf(menu._id) > -1) {
              res.push(menu.menuName);
            }
            if (menu.children && menu.children.length) {
              deepMapMenu(menu.children, filter, res);
            }
          });
        };
        const resultArr = [];
        if (value && value.checkedPages) {
          // eslint-disable-next-line no-use-before-define
          deepMapMenu(menuList.value, value.checkedPages, resultArr);
        }
        return resultArr.join(',').replace(/,$/, '');
      },
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
      width: 90,
    },
  ];
  // 表格数据
  const roleList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    roleName: '',
  });
  // 表格数据分页
  const pageData = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  // 加载表格数据的方法
  const getRoleList = async () => {
    const params = { ...pageData, ...query };
    const { page, list } = await $api.getRoleList(params);
    if (page && list) {
      roleList.value = list;
      pageData.total = page.total;
    }
  };
  // 查询、重置查询数据方法
  const handleQuerySubmit = (options) => {
    const { reset, pageNum, pageSize } = options;
    if (reset) {
      proxy.$refs.queryForm.resetFields();
    }
    pageData.pageNum = pageNum || 1;
    pageData.pageSize = pageSize || 10;
    getRoleList();
  };
  // （调用子组件的方法）弹出编辑弹窗
  const showDialog = (show, action, roleInfo) => {
    proxy.$refs.roleOperateDialog.handleToggleDialogShow(show, action, roleInfo);
  };
  // 删除一项
  const handleSingleDel = async (row) => {
    if (row && row._id) {
      const res = await $api.roleOperate({
        _id: row._id,
        roleName: row.roleName,
        action: 'delete',
      });
      if (res === true) {
        proxy.$message.success('删除成功！');
        getRoleList();
      } else {
        proxy.$message.error('删除失败！');
      }
    }
  };
  // 权限设置菜单列表
  const menuList = ref([]);
  // 加载表格数据的方法
  const getMenuList = async () => {
    const list = await $api.getMenuList();
    if (list) {
      menuList.value = list;
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getRoleList();
    getMenuList();
  });
  return {
    tableColumns,
    roleList,
    query,
    pageData,
    menuList,
    getRoleList,
    handleQuerySubmit,
    showDialog,
    handleSingleDel,
  };
};

export default {
  name: 'Role',
  components: {
    RoleOperateDialog,
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    const { proxy } = getCurrentInstance();
    return {
      ...useRoleTableInitEffect(proxy),
    };
  },
};
</script>
